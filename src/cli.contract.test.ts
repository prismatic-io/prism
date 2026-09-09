import { readFile } from "node:fs/promises";
import { Parser } from "incur";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  mutatingCommandIds,
  normalizeCommandArguments,
  potentiallyDestructiveCommandIds,
  resolveAgentMode,
  serve,
} from "./cli.js";
import {
  decodePassthroughArgument,
  encodePassthroughArgument,
  runWithMcpTransport,
  type Field,
  type Fields,
  schemaFieldName,
} from "./command.js";
import { Commands } from "./index.js";

const legacyField = z.object({
  allowNo: z.boolean().optional(),
  char: z.string().optional(),
  default: z.unknown().optional(),
  dependsOn: z.array(z.string()).optional(),
  description: z.string().optional(),
  exclusive: z.array(z.string()).optional(),
  multiple: z.boolean().optional(),
  options: z.array(z.unknown()).optional(),
  required: z.boolean().optional(),
  type: z.string().optional(),
});

const legacyManifest = z
  .object({
    commands: z.record(
      z.string(),
      z.object({
        args: z.record(z.string(), legacyField),
        description: z.string().optional(),
        flags: z.record(z.string(), legacyField),
      }),
    ),
  })
  .parse(
    JSON.parse(
      await readFile(new URL("../test/fixtures/legacy-cli-contract.json", import.meta.url), "utf8"),
    ),
  );

const globalNames = new Set(["print-requests", "profile", "quiet"]);
const additivePaginationNames = new Set(["after", "all", "first"]);
const additiveAgentInputNames = new Set([
  "action",
  "action-inputs",
  "connection",
  "connection-inputs",
  "tenant-id",
]);
const additiveOptionNames = new Set([...additivePaginationNames, ...additiveAgentInputNames]);
const sample = (field: Field): unknown => {
  if (field.options?.length) return field.multiple ? [field.options[0]] : field.options[0];
  if (field.kind === "boolean") return true;
  if (field.kind === "integer") return 1;
  return field.multiple ? ["compat-first", "compat-second"] : "compat-value";
};

const requiredInput = (fields: Fields): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(fields).flatMap(([name, field]) =>
      field.required ? [[name, sample(field)]] : [],
    ),
  );

// These legacy flow flags already required tailing at runtime; native schemas
// now express that requirement before handler execution.
const satisfyCommandConstraints = (id: string, values: Record<string, unknown>) => {
  if (
    id === "components:dev:run" &&
    values.integrationId === undefined &&
    values.instanceId === undefined
  )
    return { ...values, integrationId: "compat-value" };
  if (
    id === "integrations:flows:test" &&
    ["cni-auto-end", "result-file", "jsonl"].some((name) => values[name])
  ) {
    return { ...values, "tail-logs": true };
  }
  return values;
};

const optionArgv = (
  fields: Fields,
  values: Record<string, unknown>,
  shortName?: string,
): string[] =>
  Object.entries(values).flatMap(([name, value]) => {
    const field = fields[name];
    const flag = shortName === name && field.char ? `-${field.char}` : `--${name}`;
    const entries = Array.isArray(value) ? value : [value];
    return entries.flatMap((entry) => (field.kind === "boolean" ? [flag] : [flag, String(entry)]));
  });

const schemaInput = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).map(([name, value]) => [schemaFieldName(name), value]));

describe("legacy command contract", () => {
  it("keeps safety classifications tied to public commands and MCP metadata", () => {
    for (const id of [...mutatingCommandIds, ...potentiallyDestructiveCommandIds]) {
      const command = Commands[id];
      expect(command, `${id} is a public command`).toBeDefined();
      expect(command.destructive, `${id} is advertised as destructive`).toBe(true);
      expect(command.mcp?.annotations, `${id} has destructive MCP annotations`).toMatchObject({
        destructiveHint: true,
        readOnlyHint: false,
      });
    }

    for (const id of mutatingCommandIds) {
      expect(Commands[id].mutates, `${id} receives the static runtime guard`).toBe(true);
    }
    expect(Commands["graphql:query"].mutates).not.toBe(true);
    expect(Commands["customers:list"].mcp?.annotations).toMatchObject({
      destructiveHint: false,
      readOnlyHint: true,
    });
  });

  it("classifies every command with an unambiguously mutating verb", () => {
    const mutationVerb =
      /(?:^|:)(?:clear|create|delete|deploy|disable|enable|fork|generate|import|publish|revoke|set-debug|update|updateAvatarUrl)$/;
    const obviousMutations = Object.keys(Commands).filter((id) => mutationVerb.test(id));
    expect(obviousMutations.filter((id) => !mutatingCommandIds.has(id))).toEqual([]);
  });

  it("contains exactly the same public command IDs", () => {
    expect(
      Object.keys(Commands)
        .filter((id) => !id.startsWith("autocomplete"))
        .sort(),
    ).toEqual(Object.keys(legacyManifest.commands).sort());
    expect(Commands.autocomplete).toBeDefined();
    expect(Commands["autocomplete:script"]).toBeDefined();
  });

  for (const [id, command] of Object.entries(Commands)) {
    const legacy = legacyManifest.commands[id];
    if (!legacy) continue;

    it(`${id} preserves its description, arguments, options, aliases, and defaults`, () => {
      expect(command.description).toBe(legacy.description);
      const addedPassthroughArgs = id === "components:dev:run" ? ["command"] : [];
      expect(Object.keys(command.contract.args)).toEqual([
        ...Object.keys(legacy.args),
        ...addedPassthroughArgs,
      ]);
      for (const [name, field] of Object.entries(command.contract.args)) {
        if (addedPassthroughArgs.includes(name)) continue;
        const old = legacy.args[name];
        expect(field.description).toBe(old?.description);
        expect(field.required ?? false).toBe(old?.required ?? false);
        expect(field.default).toEqual(old?.default);
      }
      expect(
        Object.keys(command.contract.options).filter((name) => !additiveOptionNames.has(name)),
      ).toEqual(Object.keys(legacy.flags).filter((name) => !globalNames.has(name)));

      for (const [name, field] of Object.entries(command.contract.options)) {
        if (additiveOptionNames.has(name)) continue;
        const old = legacy.flags[name];
        expect(old, `${id} --${name} existed in the legacy manifest`).toBeDefined();
        // Legacy assigned -n to both --flow-name and --no-prompt. The latter was
        // unreachable, so retain the useful string alias and drop the collision.
        if (!(id === "integrations:flows:listen" && name === "no-prompt")) {
          expect(field.char).toBe(old?.char);
        }
        expect(field.kind === "boolean" ? "boolean" : "option").toBe(old?.type);
        if (old?.default !== undefined) expect(field.default).toEqual(old.default);
        if (!name.startsWith("no-")) expect(field.description).toBe(old?.description);
        expect(field.multiple ?? false).toBe(old?.multiple ?? false);
        expect(field.options).toEqual(old?.options);
        expect(field.required ?? false).toBe(old?.required ?? false);
      }
    });

    it(`${id} accepts each option and validates every declared relationship`, () => {
      const base = requiredInput(command.contract.options);
      for (const [name, field] of Object.entries(command.contract.options)) {
        const candidate = satisfyCommandConstraints(id, { ...base, [name]: sample(field) });
        expect(command.options?.safeParse(schemaInput(candidate)).success, `${id} --${name}`).toBe(
          true,
        );

        for (const exclusive of field.exclusive ?? []) {
          const invalid = {
            ...candidate,
            [exclusive]: sample(command.contract.options[exclusive]),
          };
          expect(
            command.options?.safeParse(schemaInput(invalid)).success,
            `${id} --${name} + --${exclusive}`,
          ).toBe(false);
        }

        if (field.options?.length) {
          expect(
            command.options?.safeParse(schemaInput({ ...base, [name]: "__invalid_enum_value__" }))
              .success,
          ).toBe(false);
        }
      }
    });

    it(`${id} parses every long option and short alias through incur`, () => {
      const requiredArgs = Object.entries(command.contract.args).flatMap(([, field]) =>
        field.required ? [String(sample(field))] : [],
      );
      for (const [name, field] of Object.entries(command.contract.options)) {
        const values = satisfyCommandConstraints(id, {
          ...requiredInput(command.contract.options),
          [name]: sample(field),
        });
        const long = optionArgv(command.contract.options, values);
        const normalized = normalizeCommandArguments([id, ...requiredArgs, ...long]).slice(
          id.split(":").length,
        );
        const parsedLong = Parser.parse(normalized, {
          alias: command.alias,
          args: command.args,
          options: command.options,
        });
        const expected = name.startsWith("no-") && field.kind === "boolean" ? false : values[name];
        expect(parsedLong.options[schemaFieldName(name)], `${id} --${name} value`).toEqual(
          expected,
        );

        if (field.char) {
          const short = normalizeCommandArguments([
            id,
            ...requiredArgs,
            ...optionArgv(command.contract.options, values, name),
          ]).slice(id.split(":").length);
          const parsedShort = Parser.parse(short, {
            alias: command.alias,
            args: command.args,
            options: command.options,
          });
          // A short alias supplies true to the schema; legacy no-* inversion is
          // performed by the runtime when restoring the public option name.
          const shortExpected =
            name.startsWith("no-") && field.kind === "boolean" ? true : values[name];
          expect(parsedShort.options[schemaFieldName(name)], `${id} -${field.char} value`).toEqual(
            shortExpected,
          );
        }
      }
    });
  }
});

describe("command separators and agent mode", () => {
  it("normalizes every legacy colon route without changing its arguments", () => {
    for (const id of Object.keys(Commands)) {
      expect(normalizeCommandArguments([id, "--help"])).toEqual([...id.split(":"), "--help"]);
    }
  });

  it("normalizes routes after value-taking global options", () => {
    expect(normalizeCommandArguments(["--profile", "staging", "customers:list", "--help"])).toEqual(
      ["--profile", "staging", "customers", "list", "--help"],
    );
    expect(normalizeCommandArguments(["--format", "json", "customers:list"])).toEqual([
      "--format",
      "json",
      "customers",
      "list",
    ]);
  });

  it("supports the legacy help command form", () => {
    expect(normalizeCommandArguments(["help", "customers"])).toEqual(["customers", "--help"]);
    expect(normalizeCommandArguments(["help", "customers:list"])).toEqual([
      "customers",
      "list",
      "--help",
    ]);
  });

  it("keeps legacy autocomplete entry points", () => {
    expect(normalizeCommandArguments(["autocomplete:script", "zsh"])).toEqual([
      "autocomplete",
      "script",
      "zsh",
    ]);
  });

  it("protects child-process flags after the passthrough delimiter", () => {
    const normalized = normalizeCommandArguments([
      "components:dev:run",
      "--",
      "node",
      "script.js",
      "--agent",
      "--inspect",
    ]);
    expect(normalized.slice(0, 3)).toEqual(["components", "dev", "run"]);
    expect(normalized.slice(3).map(decodePassthroughArgument)).toEqual([
      "node",
      "script.js",
      "--agent",
      "--inspect",
    ]);
    expect(resolveAgentMode(["components:dev:run", "--", "node", "--agent"], {})).toBe(false);
  });

  it("preserves every child-process argument byte-for-byte after the delimiter", () => {
    const passthrough = [
      "",
      " ",
      "a b",
      "--agent",
      "--integrationId=foo",
      "--no-header",
      "-nVALUE",
      "--flag=x=y",
      "'\"$&|;<>*?[]{}()",
      "line\nwith\ttabs",
      "é/雪/🙂",
    ];
    const normalized = normalizeCommandArguments(["components:dev:run", "--", ...passthrough]);
    expect(normalized.slice(0, 3)).toEqual(["components", "dev", "run"]);
    expect(normalized.slice(3).map(decodePassthroughArgument)).toEqual(passthrough);
  });

  it("has unique short aliases within every command", () => {
    for (const [id, command] of Object.entries(Commands)) {
      const aliases = Object.values(command.contract.options).flatMap((field) =>
        field.char ? [field.char] : [],
      );
      expect(new Set(aliases).size, id).toBe(aliases.length);
    }
  });

  it("rejects extra positional arguments instead of silently discarding them", async () => {
    await serve(["--agent", "profiles:list", "extra"], {});
    expect(process.exitCode).toBe(2);
    process.exitCode = undefined;
    await serve(["--agent", "customers:delete", "one", "two"], {});
    expect(process.exitCode).toBe(2);
    process.exitCode = undefined;
  });

  it("rejects repeated scalar flags like oclif", async () => {
    await serve(["--agent", "customers:create", "--name", "first", "--name", "second"], {});
    expect(process.exitCode).toBe(2);
    process.exitCode = undefined;
  });

  it("exposes bounded, resumable pagination on secondary list commands", () => {
    const paginatedCommands = [
      "alerts:groups:list",
      "alerts:monitors:list",
      "alerts:webhooks:list",
      "customers:users:list",
      "organization:users:list",
      "instances:config-vars:list",
      "instances:flow-configs:list",
      "components:actions:list",
      "components:data-sources:list",
      "components:triggers:list",
      "integrations:flows:list",
    ];

    for (const id of paginatedCommands) {
      const options = Commands[id].contract.options;
      expect(options, id).toHaveProperty("after");
      expect(options, id).toHaveProperty("first");
      expect(options, id).toHaveProperty("all");
      expect(Commands[id].output?.safeParse({ items: [] }).success, id).toBe(false);
      expect(
        Commands[id].output?.safeParse({
          items: [],
          pageInfo: { hasNextPage: true, endCursor: "next-page" },
        }).success,
        id,
      ).toBe(true);
    }
  });

  it("reports legacy no-* exclusivity without treating the flag as an argument", () => {
    const command = Commands["customers:list"];
    expect(() =>
      Parser.parse(normalizeCommandArguments(["customers:list", "--csv", "--no-header"]).slice(2), {
        alias: command.alias,
        args: command.args,
        options: command.options,
      }),
    ).toThrow(/cannot also be provided/i);
  });

  it("preserves positive legacy no-* options through incur's negation parser", () => {
    expect(normalizeCommandArguments(["customers:list", "--no-header", "--no-truncate"])).toEqual([
      "customers",
      "list",
      "--no-header",
      "--no-truncate",
    ]);
    expect(() =>
      normalizeCommandArguments(["integrations:flows:listen", "--no-no-prompt"]),
    ).toThrow("Unknown option");
  });

  it("supports explicit enable and disable flags with explicit precedence", () => {
    expect(resolveAgentMode(["--agent"], {})).toBe(true);
    expect(resolveAgentMode(["--no-agent"], { CODEX: "1" })).toBe(false);
    expect(() => resolveAgentMode(["--agent", "--no-agent"], {})).toThrow();
    expect(resolveAgentMode(["--agent=true"], {})).toBe(true);
    expect(resolveAgentMode(["--agent=false"], { CODEX: "1" })).toBe(false);
    expect(resolveAgentMode(["--no-agent=false"], {})).toBe(true);
    expect(normalizeCommandArguments(["--no-agent=true", "profiles:list"])).toEqual([
      "--no-agent",
      "profiles",
      "list",
    ]);
  });

  it("tracks whether the payload content type was explicitly supplied", () => {
    const command = Commands["integrations:flows:test"];
    expect(command.options?.parse({})["payload-content-type"]).toBeUndefined();
    expect(
      command.options?.parse({ "payload-content-type": "application/json" })[
        "payload-content-type"
      ],
    ).toBe("application/json");
    expect(command.contract.options["payload-content-type"].default).toBe("application/json");
  });

  it.each([
    "CLAUDE_CODE",
    "CLAUDECODE",
    "CURSOR_AGENT",
    "CODEX",
    "OPENAI_CODEX",
    "AIDER",
    "CLINE",
    "WINDSURF_AGENT",
    "GITHUB_COPILOT",
    "AMAZON_Q",
    "AWS_Q_DEVELOPER",
    "GEMINI_CODE_ASSIST",
    "SRC_CODY",
    "PI_CODING_AGENT",
    "FORCE_AGENT_MODE",
    "PRISM_AGENT",
    "PRISM_AGENT_MODE",
  ])("detects %s", (name) => {
    expect(resolveAgentMode([], { [name]: "true" })).toBe(true);
  });

  it("supports environment-level forced human mode", () => {
    expect(resolveAgentMode([], { CODEX: "1", FORCE_HUMAN_MODE: "true" })).toBe(false);
    expect(resolveAgentMode([], { CODEX: "1", PRISM_NO_AGENT: "1" })).toBe(false);
  });
});

describe("opaque values at the compatibility boundary", () => {
  it("parses every protected variadic child argument through native incur", () => {
    const command = Commands["components:dev:run"];
    const child = [
      "node",
      "script.js",
      "--help",
      "",
      "--agent",
      "__PRISM_PASSTHROUGH__ZmFsc2U",
      "雪",
    ];
    const normalized = normalizeCommandArguments([
      "components:dev:run",
      "--integrationId",
      "integration",
      "--connectionKey",
      "connection",
      "--",
      ...child,
    ]);
    const parsed = Parser.parse(normalized.slice(3), {
      args: command.args,
      options: command.options,
      alias: command.alias,
    });
    expect(parsed.args.command).toEqual(child);
  });

  it("never decodes MCP argument text, even when it matches a generated marker", () => {
    const name = encodePassthroughArgument("literal");
    expect(runWithMcpTransport(() => Commands["profiles:use"].args?.parse({ name }))).toEqual({
      name,
    });
  });

  it.each(["-n=hello", "-nhello"])("supports attached short value %s", (flag) => {
    const command = Commands["customers:create"];
    const normalized = normalizeCommandArguments(["customers:create", flag]);
    expect(
      Parser.parse(normalized.slice(2), {
        args: command.args,
        alias: command.alias,
        options: command.options,
      }).options.name,
    ).toBe("hello");
  });

  it("treats -h as an option value and preserves global --help preemption", () => {
    expect(normalizeCommandArguments(["customers:create", "--name", "-h"])).toEqual([
      "customers",
      "create",
      "--name=-h",
    ]);
    expect(normalizeCommandArguments(["customers:create", "--name", "--help"])).toEqual([
      "customers",
      "create",
      "--name",
      "--help",
    ]);
  });

  it("maps a command-owned -h to its canonical option before incur help extraction", () => {
    expect(normalizeCommandArguments(["alerts:webhooks:create", "-h={}"])).toEqual([
      "alerts",
      "webhooks",
      "create",
      "--headers",
      "{}",
    ]);
  });

  it.each([
    ["false", false],
    ["0", false],
    ["no", false],
    ["true", true],
    ["1", true],
  ])("preserves boolean positional %s after the delimiter", (value, expected) => {
    const command = Commands["integrations:set-debug"];
    const normalized = normalizeCommandArguments(["integrations:set-debug", "--", String(value)]);
    expect(
      Parser.parse(normalized.slice(2), { args: command.args, options: command.options }).args
        .debug,
    ).toBe(expected);
  });

  it.each([
    "__PRISM_PASSTHROUGH__ZmFsc2U",
    "__PRISM_PASSTHROUGH__",
    "--help",
  ])("preserves literal prefix-like positional %s", (value) => {
    const command = Commands["profiles:use"];
    const normalized = normalizeCommandArguments(["profiles:use", "--", value]);
    expect(
      Parser.parse(normalized.slice(2), { args: command.args, options: command.options }).args.name,
    ).toBe(value);
  });

  it("does not interpret option values as agent mode switches", () => {
    expect(resolveAgentMode(["customers:create", "--name", "--agent"], {})).toBe(false);
    expect(resolveAgentMode(["--profile", "--agent", "customers:list"], {})).toBe(false);
  });

  it("protects delimiter arguments from incur builtins", () => {
    const normalized = normalizeCommandArguments(["profiles:use", "--", "--help"]);
    expect(normalized.slice(0, 2)).toEqual(["profiles", "use"]);
    expect(normalized.slice(2).map(decodePassthroughArgument)).toEqual(["--help"]);
  });

  it.each([
    "integrations:flows:listen",
    "customers:create",
    "--integrationId=x",
    "-nVALUE",
  ])("preserves the option value %s", (value) => {
    const command = Commands["customers:create"];
    const normalized = normalizeCommandArguments(["customers", "create", "--name", value]);
    const parsed = Parser.parse(normalized.slice(2), {
      alias: command.alias,
      args: command.args,
      options: command.options,
    });
    expect(parsed.options.name).toBe(value);
  });

  it("does not resolve a profile value or positional value as a command", () => {
    expect(
      normalizeCommandArguments(["--profile", "integrations:flows:listen", "customers:list"]),
    ).toEqual(["--profile", "integrations:flows:listen", "customers", "list"]);
    expect(normalizeCommandArguments(["customers", "delete", "integrations:flows:listen"])).toEqual(
      ["customers", "delete", "integrations:flows:listen"],
    );
  });

  it.each([
    ["--label", "A", "B"],
    ["--label=A", "B"],
    ["--label", "A", "--label", "B"],
  ])("accepts oclif multi-value options: %j", (...flags) => {
    const command = Commands["customers:create"];
    const normalized = normalizeCommandArguments(["customers:create", "--name", "Test", ...flags]);
    const parsed = Parser.parse(normalized.slice(2), {
      alias: command.alias,
      args: command.args,
      options: command.options,
    });
    expect(parsed.options.label).toEqual(["A", "B"]);
  });
});

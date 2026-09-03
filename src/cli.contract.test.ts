import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { Parser } from "incur";
import { z } from "zod";
import { decodePassthroughArgument, schemaFieldName, type Field, type Fields } from "./command.js";
import { normalizeCommandArguments, renderHumanHelp, resolveAgentMode, serve } from "./cli.js";
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
const sample = (field: Field): unknown => {
  if (field.default !== undefined) return field.default;
  if (field.options?.length) return field.multiple ? [field.options[0]] : field.options[0];
  if (field.kind === "boolean") return true;
  if (field.kind === "integer") return 1;
  return field.multiple ? ["value"] : "value";
};

const requiredInput = (fields: Fields): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(fields).flatMap(([name, field]) =>
      field.required && !field.exactlyOne ? [[name, sample(field)]] : [],
    ),
  );

const satisfyExactlyOne = (
  fields: Fields,
  values: Record<string, unknown>,
  preferred?: string,
): Record<string, unknown> => {
  const result = { ...values };
  for (const [name, field] of Object.entries(fields)) {
    if (!field.exactlyOne) continue;
    const names = [...new Set([name, ...(field.exactlyOne as string[])])];
    const selected = preferred && names.includes(preferred) ? preferred : names[0];
    for (const candidate of names) delete result[candidate];
    result[selected] = sample(fields[selected]);
  }
  return result;
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
      expect(Object.keys(command.contract.options)).toEqual(
        Object.keys(legacy.flags).filter((name) => !globalNames.has(name)),
      );

      for (const [name, field] of Object.entries(command.contract.options)) {
        const old = legacy.flags[name];
        expect(old, `${id} --${name} existed in the legacy manifest`).toBeDefined();
        expect(field.char).toBe(old?.char);
        if (old?.default !== undefined) expect(field.default).toEqual(old.default);
        expect(field.description).toBe(old?.description);
        expect(field.multiple ?? false).toBe(old?.multiple ?? false);
        expect(field.options).toEqual(old?.options);
        expect(field.required ?? false).toBe(old?.required ?? false);
      }
    });

    it(`${id} accepts each option and validates every declared relationship`, () => {
      const base = satisfyExactlyOne(
        command.contract.options,
        requiredInput(command.contract.options),
      );
      for (const [name, field] of Object.entries(command.contract.options)) {
        const candidate = satisfyExactlyOne(
          command.contract.options,
          { ...base, [name]: sample(field) },
          name,
        );
        for (const dependency of field.dependsOn ?? []) {
          candidate[dependency] = sample(command.contract.options[dependency]);
        }
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
        const values = satisfyExactlyOne(
          command.contract.options,
          { ...requiredInput(command.contract.options), [name]: sample(field) },
          name,
        );
        const long = optionArgv(command.contract.options, values);
        const normalized = normalizeCommandArguments([id, ...requiredArgs, ...long]).slice(
          id.split(":").length,
        );
        expect(() =>
          Parser.parse(normalized, {
            alias: command.alias,
            args: command.args,
            options: command.options,
          }),
        ).not.toThrow();

        if (field.char) {
          const short = [...requiredArgs, ...optionArgv(command.contract.options, values, name)];
          expect(() =>
            Parser.parse(short, {
              alias: command.alias,
              args: command.args,
              options: command.options,
            }),
          ).not.toThrow();
        }
      }
    });
  }
});

describe("command separators and agent mode", () => {
  it("keeps legacy command and flag spellings in Incur-rendered help", () => {
    expect(
      renderHumanHelp("Usage: prism on-prem-resources registration-jwt --customer-id <value>", [
        "on-prem-resources",
        "registration-jwt",
        "--help",
      ]),
    ).toBe("Usage: prism on-prem-resources:registration-jwt --customerId <value>");
  });
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

  it("rejects extra positional arguments instead of silently discarding them", async () => {
    await expect(serve(["profiles:list", "extra"], {})).rejects.toMatchObject({ exitCode: 2 });
    await expect(serve(["customers:delete", "one", "two"], {})).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it("rejects repeated scalar flags like oclif", async () => {
    await expect(
      serve(["customers:create", "--name", "first", "--name", "second"], {}),
    ).rejects.toMatchObject({ exitCode: 2 });
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
      "--legacy-no-header",
      "--legacy-no-truncate",
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

import { Cli, Parser, z } from "incur";
import packageJson from "../package.json" with { type: "json" };
import legacyHelpJson from "./legacy-help.json" with { type: "json" };
import { Commands } from "./index.js";
import {
  consumeCommandExitCode,
  encodePassthroughArgument,
  getRequestedCommandExitCode,
  schemaFieldName,
} from "./command.js";

const topicDescriptions: Record<string, string> = {
  alerts: "Manage Alerting resources",
  "alerts:groups": "Manage Alert Groups",
  "alerts:monitors": "Manage Alert Monitors",
  "alerts:webhooks": "Manage Alert Webhooks",
  components: "Manage, create, and publish Components",
  "components:dev": "Component development utilities",
  "components:init": "Create Components",
  customers: "Manage Customers",
  "customers:users": "Manage Customer Users",
  executions: "Fetch results of Instance executions or Integration test runs",
  graphql: "Execute GraphQL queries against the Prismatic API",
  instances: "Manage Instances",
  integrations: "Manage and import Integrations",
  logs: "Inspect Prismatic log data",
  "logs:severities": "Manage log severity levels",
  "on-prem-resources": "Manage on-premise resources",
  organization: "Manage your Organization",
  "organization:users": "Manage Organization Users",
  profiles: "Manage authentication profiles",
  translations: "Manage translations",
  workflows: "Manage embedded workflow builder workflows and templates",
};

const globalOptions = z.object({
  agent: z.boolean().optional().describe("Force structured output optimized for AI agents"),
  printRequests: z.boolean().optional().describe("Print all GraphQL requests that are issued"),
  profile: z.string().optional().describe("Use a profile"),
  quiet: z.boolean().default(false).describe("Reduce helpful notes and text"),
});

const environmentOptions = z.object({
  PRISM_AGENT: z.string().optional().describe("Force agent mode when set to true or 1"),
  PRISM_AGENT_MODE: z.string().optional().describe("Force agent mode when set to true or 1"),
  FORCE_AGENT_MODE: z.string().optional().describe("Force agent mode when set to true or 1"),
  PRISM_NO_AGENT: z.string().optional().describe("Force human mode when set to true or 1"),
  FORCE_HUMAN_MODE: z.string().optional().describe("Force human mode when set to true or 1"),
});

const legacyHelp = z
  .record(
    z.string(),
    z.object({ status: z.number().nullable(), stderr: z.string(), stdout: z.string() }),
  )
  .parse(legacyHelpJson);

const legacyBuiltinHelp: Record<string, string> = {
  autocomplete: `Display autocomplete installation instructions.

USAGE
  $ prism autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ prism autocomplete

  $ prism autocomplete bash

  $ prism autocomplete zsh

  $ prism autocomplete powershell

  $ prism autocomplete --refresh-cache

`,
  "autocomplete:script": `outputs autocomplete config script for shells

USAGE
  $ prism autocomplete:script [SHELL]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

DESCRIPTION
  outputs autocomplete config script for shells

`,
};

type Tree = { command?: any; children: Map<string, Tree> };
const root: Tree = { children: new Map() };

for (const [id, command] of Object.entries(Commands)) {
  let node = root;
  for (const segment of id.split(":")) {
    const next = node.children.get(segment) ?? { children: new Map() };
    node.children.set(segment, next);
    node = next;
  }
  node.command = command;
}

const mount = (name: string, node: Tree, path: string): any => {
  const description = node.command?.description ?? topicDescriptions[path];
  const cli = node.command
    ? Cli.create(name, { ...node.command, description })
    : Cli.create(name, { description });
  for (const [childName, child] of node.children) {
    cli.command(mount(childName, child, path ? `${path}:${childName}` : childName));
  }
  if (
    node.command &&
    node.children.size > 0 &&
    Object.keys(node.command.contract.args).length > 0
  ) {
    cli.command(Cli.create("__self", { ...node.command, hidden: true }));
  }
  return cli;
};

export const cli: any = Cli.create("prism", {
  description: packageJson.description,
  env: environmentOptions,
  globalAlias: {},
  globals: globalOptions,
  mcp: {
    instructions:
      "Manage Prismatic integrations and resources. Prefer read commands before destructive changes.",
    title: "Prismatic CLI",
  },
  outputPolicy: "agent-only",
  version: packageJson.version,
});

for (const [name, node] of root.children) cli.command(mount(name, node, name));

export default cli;

const agentEnvironmentVariables = [
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
] as const;

const truthy = (value: string | undefined) => value === "1" || value?.toLowerCase() === "true";

const beforeDelimiter = (argv: string[]) => {
  const delimiter = argv.indexOf("--");
  return delimiter < 0 ? argv : argv.slice(0, delimiter);
};

export const normalizeCommandArguments = (argv: string[]): string[] => {
  const helpCompatibleArgv = argv[0] === "help" ? [...argv.slice(1), "--help"] : argv;
  const valueAliases = new Set(
    Object.values(Commands).flatMap((command) =>
      Object.values(command.contract.options).flatMap((field) =>
        field.char && field.kind !== "boolean" ? [field.char] : [],
      ),
    ),
  );
  const compatibleArgv = helpCompatibleArgv.flatMap((value) => {
    const match = /^--(no-)?agent=(true|false)$/i.exec(value);
    if (match) {
      const enabled = (match[1] === undefined) === (match[2]?.toLowerCase() === "true");
      return enabled ? ["--agent"] : ["--no-agent"];
    }
    const attachedShortValue = /^-([A-Za-z])(.*)$/.exec(value);
    if (
      attachedShortValue?.[1] &&
      attachedShortValue[2] &&
      valueAliases.has(attachedShortValue[1])
    ) {
      return [`-${attachedShortValue[1]}`, attachedShortValue[2]];
    }
    return [value];
  });
  const listenCommand = compatibleArgv.some(
    (value, index) =>
      value === "integrations:flows:listen" ||
      (value === "integrations" &&
        compatibleArgv[index + 1] === "flows" &&
        compatibleArgv[index + 2] === "listen"),
  );
  const normalized = compatibleArgv.map((value) => {
    if (listenCommand && value === "-n") return "--flow-name";
    if (!value.startsWith("--")) return value;
    const equals = value.indexOf("=");
    const name = value.slice(2, equals < 0 ? undefined : equals);
    if (
      name.startsWith("no-no-") &&
      Object.values(Commands).some((command) =>
        Object.hasOwn(command.contract.options, name.slice(3)),
      )
    ) {
      const error = new Error(`Unknown option: --${name}`);
      Object.assign(error, { exitCode: 2 });
      throw error;
    }
    const commandOption = Object.values(Commands).find(
      (command) => name in command.contract.options,
    );
    if (!commandOption) return value;
    // Incur reserves `--no-*` for negation, so map Prism's positive legacy names internally.
    if (name.startsWith("no-")) {
      const internal = schemaFieldName(name).replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      return `--${internal}${equals < 0 ? "" : value.slice(equals)}`;
    }
    if (!/[A-Z]/.test(name)) return value;
    const kebab = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    return `--${kebab}${equals < 0 ? "" : value.slice(equals)}`;
  });
  const roots = new Set(Object.keys(Commands).map((name) => name.split(":", 1)[0]));
  if (
    normalized[0] === "autocomplete" &&
    normalized[1] !== "script" &&
    !beforeDelimiter(normalized).includes("--help")
  ) {
    normalized.splice(1, 0, "__self");
  }
  const index = normalized.findIndex((value) => {
    const [root, child] = value.split(":", 2);
    return Boolean(child) && roots.has(root);
  });
  if (index < 0) return normalized;
  const routed = [
    ...normalized.slice(0, index),
    ...normalized[index].split(":"),
    ...normalized.slice(index + 1),
  ];
  const routedCommand = Object.entries(Commands).find(([id]) => id === normalized[index])?.[1];
  if (
    routedCommand &&
    !beforeDelimiter(normalized).includes("--help") &&
    Object.keys(routedCommand.contract.args).length > 0 &&
    Object.keys(Commands).some((id) => id.startsWith(`${normalized[index]}:`))
  ) {
    routed.splice(index + normalized[index].split(":").length, 0, "__self");
  }
  if (normalized[index] === "components:dev:run") {
    const delimiter = routed.indexOf("--");
    if (delimiter >= 0) {
      routed.splice(
        delimiter,
        routed.length - delimiter,
        ...routed.slice(delimiter + 1).map(encodePassthroughArgument),
      );
    }
  }
  return routed;
};

const resolveCommandPath = (argv: string[]): string => {
  const roots = new Set(root.children.keys());
  for (let start = 0; start < argv.length; start += 1) {
    if (!roots.has(argv[start] ?? "")) continue;
    let node = root;
    const path: string[] = [];
    for (let index = start; index < argv.length; index += 1) {
      const child = node.children.get(argv[index] ?? "");
      if (!child) break;
      path.push(argv[index]);
      node = child;
    }
    return path.join(":");
  }
  return "";
};

const assertCommandArity = (argv: string[]) => {
  const commandPath = resolveCommandPath(argv);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  if (!command || beforeDelimiter(argv).includes("--help")) return;
  const segments = commandPath.split(":");
  const routeStart = argv.findIndex((_value, index) =>
    segments.every((segment, offset) => argv[index + offset] === segment),
  );
  if (routeStart < 0) return;
  const fields = new Map<string, { multiple: boolean; name: string; takesValue: boolean }>();
  for (const [name, field] of Object.entries(command.contract.options)) {
    const internal = schemaFieldName(name).replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    );
    const descriptor = {
      multiple: field.multiple === true,
      name,
      takesValue: field.kind !== "boolean",
    };
    fields.set(`--${internal}`, descriptor);
    if (field.char) fields.set(`-${field.char}`, descriptor);
  }
  for (const name of ["profile", "format", "filter-output", "token-limit", "token-offset"]) {
    fields.set(`--${name}`, { multiple: false, name, takesValue: true });
  }
  for (const name of [
    "agent",
    "print-requests",
    "quiet",
    "full-output",
    "help",
    "llms",
    "llms-full",
    "schema",
    "token-count",
  ]) {
    const descriptor = { multiple: false, name, takesValue: false };
    fields.set(`--${name}`, descriptor);
    fields.set(`--no-${name}`, descriptor);
  }
  let positionalCount = 0;
  const seen = new Set<string>();
  const args = Object.values(command.contract.args);
  const values = argv
    .slice(routeStart + segments.length)
    .filter((value, index) => value !== "__self" || index !== 0);
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index] ?? "";
    if (!token.startsWith("-")) {
      positionalCount += 1;
      continue;
    }
    const name = token.split("=", 1)[0] ?? token;
    const field = fields.get(name);
    if (!field) return;
    if (!field.takesValue && token.includes("=")) {
      const positional = values.find((value) => value !== "__self" && !value.startsWith("-"));
      if (args.at(-1)?.multiple || positionalCount < args.length) {
        const actualIndex = argv.indexOf(token, routeStart + segments.length);
        if (actualIndex >= 0) {
          argv.splice(actualIndex, 1, name, token.slice(token.indexOf("=") + 1));
          positionalCount += 1;
          continue;
        }
      }
      const argument =
        args.at(-1)?.kind !== "boolean" && args.length > 0 && positional
          ? positional
          : token.slice(token.indexOf("=") + 1);
      const error = new Error(`Unexpected argument: ${argument}`);
      Object.assign(error, { exitCode: 2, showHelp: true });
      throw error;
    }
    if (field.takesValue && !field.multiple && seen.has(field.name)) {
      const error = new Error(`Flag --${field.name} can only be specified once`);
      Object.assign(error, { exitCode: 2 });
      throw error;
    }
    seen.add(field.name);
    if (field.takesValue && !token.includes("=")) index += 1;
  }
  if (!args.at(-1)?.multiple && positionalCount > args.length) {
    const error = new Error(`Unexpected argument: ${values.at(-1)}`);
    Object.assign(error, { exitCode: 2, showHelp: true });
    throw error;
  }
};

const incurValidationError = z.object({
  fieldErrors: z.array(
    z.object({
      code: z.string(),
      missing: z.boolean(),
      path: z.string(),
    }),
  ),
}).safeParse;

const wrapPreservingBreakSpace = (value: string, width: number, continuation = "") => {
  const lines: string[] = [];
  let remaining = value;
  while (remaining.length > width) {
    const breakAt = remaining.lastIndexOf(" ", width);
    if (breakAt < 0) break;
    lines.push(remaining.slice(0, breakAt + 1));
    remaining = `${continuation}${remaining.slice(breakAt + 1)}`;
  }
  lines.push(remaining);
  return lines;
};

const legacyMissingArgMessage = (
  name: string,
  description: string,
  multipleOption: string | undefined,
) => {
  const column = `${name}  `;
  const tableLines = wrapPreservingBreakSpace(
    `${column}${description}`,
    79,
    " ".repeat(column.length),
  );
  const rendered = tableLines.flatMap((line) => {
    const parts = wrapPreservingBreakSpace(line, 75);
    const last = parts.at(-1);
    if (last !== undefined) parts[parts.length - 1] = last.trimEnd();
    return parts;
  });
  const note = multipleOption
    ? [
        " ›",
        ` ›   Note: --${multipleOption} allows multiple values. Because of this you need to provide `,
        " ›   all arguments before providing that flag.",
        ' ›   Alternatively, you can use "--" to signify the end of the flags and the ',
        " ›   beginning of arguments.",
      ]
    : [];
  return ["Missing 1 required arg:", ...rendered.map((line) => ` ›   ${line}`), ...note].join("\n");
};

const legacyValidationMessage = (
  error: unknown,
  command: (typeof Commands)[keyof typeof Commands],
  argv: string[],
) => {
  const parsed = incurValidationError(error);
  const issue = parsed.success ? parsed.data.fieldErrors[0] : undefined;
  if (!issue) return error instanceof Error ? error.message : String(error);
  const missingOptions = parsed.success
    ? parsed.data.fieldErrors
        .filter(({ missing }) => missing)
        .flatMap(({ path }) =>
          Object.keys(command.contract.options).filter((name) => schemaFieldName(name) === path),
        )
        .sort()
    : [];
  const optionInvocation = (name: string) => {
    const field = command.contract.options[name];
    if (!field) return;
    const internal = schemaFieldName(name).replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    );
    const index = argv.findIndex((token) => {
      const optionName = token.split("=", 1)[0] ?? token;
      return optionName === `--${internal}` || optionName === (field.char ? `-${field.char}` : "");
    });
    if (index < 0) return;
    const token = argv[index] ?? "";
    const value =
      field.kind === "boolean"
        ? "true"
        : token.includes("=")
          ? token.slice(token.indexOf("=") + 1)
          : (argv[index + 1] ?? "");
    return { index, value };
  };
  const exclusiveErrors = Object.entries(command.contract.options)
    .flatMap(([usingName, field]) =>
      (field.exclusive ?? []).flatMap((subjectName) => {
        const using = optionInvocation(usingName);
        const subject = optionInvocation(subjectName);
        return using && subject
          ? [
              {
                message: `--${subjectName}=${subject.value} cannot also be provided when using --${usingName}`,
                subjectName,
              },
            ]
          : [];
      }),
    )
    .sort((left, right) => left.subjectName.localeCompare(right.subjectName))
    .filter(
      (entry, index, entries) =>
        entries.findIndex(({ message }) => message === entry.message) === index,
    )
    .map(({ message }) => message);
  const exactlyOneErrors = Object.values(command.contract.options)
    .flatMap((field) => {
      const names = field.exactlyOne;
      if (!Array.isArray(names) || !names.every((name) => typeof name === "string")) return [];
      const supplied = names.filter((name) => {
        const internal = schemaFieldName(name).replace(
          /[A-Z]/g,
          (letter) => `-${letter.toLowerCase()}`,
        );
        return argv.some(
          (token) => token === `--${internal}` || token.startsWith(`--${internal}=`),
        );
      });
      if (supplied.length === 1) return [];
      const flags = names.map((name) => `--${name}`).join(", ");
      const message = `Exactly one of the following must be provided: ${flags}`;
      return message.length > 68
        ? [
            `${message.slice(0, message.lastIndexOf(" ", 68) + 1)}\n ›   ${message.slice(message.lastIndexOf(" ", 68) + 1)}`,
          ]
        : [message];
    })
    .filter((message, index, messages) => messages.indexOf(message) === index);
  const relationshipErrors = [
    ...exclusiveErrors,
    ...exactlyOneErrors,
    ...missingOptions.map((name) => `Missing required flag ${name}`),
  ];
  if (relationshipErrors.length > 0) {
    const heading = `The following error${relationshipErrors.length === 1 ? "" : "s"} occurred:`;
    return [heading, ...relationshipErrors.map((message) => ` ›     ${message}`)].join("\n");
  }
  const optionEntry = Object.entries(command.contract.options).find(
    ([name]) => schemaFieldName(name) === issue.path,
  );
  const argEntry = Object.entries(command.contract.args).find(
    ([name]) => schemaFieldName(name) === issue.path,
  );
  if (issue.missing && argEntry) {
    const [name, field] = argEntry;
    const multipleOption = Object.entries(command.contract.options).find(
      ([, optionField]) => optionField.multiple === true,
    )?.[0];
    return legacyMissingArgMessage(name, field.description ?? "", multipleOption);
  }
  if (!optionEntry) return error instanceof Error ? error.message : String(error);
  const [name, field] = optionEntry;
  if (issue.missing) {
    return `The following error occurred:\n ›     Missing required flag ${name}`;
  }
  const internalName = schemaFieldName(name).replace(
    /[A-Z]/g,
    (letter) => `-${letter.toLowerCase()}`,
  );
  const tokenIndex = argv.findIndex((token) =>
    [`--${internalName}`, field.char ? `-${field.char}` : ""].includes(
      token.split("=", 1)[0] ?? token,
    ),
  );
  const token = argv[tokenIndex] ?? "";
  const value = token.includes("=") ? token.slice(token.indexOf("=") + 1) : argv[tokenIndex + 1];
  if (issue.code === "invalid_value" && field.options && value !== undefined) {
    return `Expected --${name}=${value} to be one of: ${field.options.join(", ")}`;
  }
  if (issue.code === "custom" && field.exclusive) {
    const conflict = field.exclusive.find((exclusive) => {
      const internal = schemaFieldName(exclusive).replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      return argv.some(
        (candidate) => candidate === `--${internal}` || candidate.startsWith(`--${internal}=`),
      );
    });
    if (conflict) {
      return `The following error occurred:\n ›     --${conflict}=true cannot also be provided when using --${name}`;
    }
  }
  return error instanceof Error && "shortMessage" in error && typeof error.shortMessage === "string"
    ? error.shortMessage
    : error instanceof Error
      ? error.message
      : String(error);
};

const validateHumanInvocation = (argv: string[]) => {
  if (argv.length === 0 || argv.some((value) => ["--help", "--version", "-v"].includes(value))) {
    return;
  }
  const { rest } = Parser.parseGlobals(argv, globalOptions, undefined, { validate: false });
  const commandPath = resolveCommandPath(rest);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  const isTopic =
    commandPath.length > 0 &&
    !command &&
    Object.keys(Commands).some((id) => id.startsWith(`${commandPath}:`));
  if (!command) {
    if (isTopic && rest.every((value) => value.startsWith("-") || commandPath.includes(value))) {
      return;
    }
    const attempted = rest.find((value) => !value.startsWith("-")) ?? rest[0];
    const error = new Error(`command ${attempted} not found`);
    Object.assign(error, { exitCode: 2 });
    throw error;
  }
  const segments = commandPath.split(":");
  const routeStart = rest.findIndex((_value, index) =>
    segments.every((segment, offset) => rest[index + offset] === segment),
  );
  const commandArgv = rest
    .slice(routeStart + segments.length)
    .filter((value, index) => value !== "__self" || index !== 0);
  const builtinValues = new Set(["--filter-output", "--format", "--token-limit", "--token-offset"]);
  const builtinBooleans = new Set([
    "--full-output",
    "--json",
    "--jsonl",
    "--llms",
    "--llms-full",
    "--md",
    "--schema",
    "--token-count",
    "--toon",
    "--yaml",
  ]);
  const filtered: string[] = [];
  for (let index = 0; index < commandArgv.length; index += 1) {
    const token = commandArgv[index] ?? "";
    const name = token.split("=", 1)[0] ?? token;
    if (builtinBooleans.has(name)) continue;
    if (builtinValues.has(name)) {
      if (!token.includes("=")) index += 1;
      continue;
    }
    filtered.push(token);
  }
  try {
    Parser.parse(filtered, { alias: command.alias, args: command.args, options: command.options });
  } catch (error) {
    if (error && typeof error === "object") {
      const parsed = incurValidationError(error);
      const issue = parsed.success ? parsed.data.fieldErrors[0] : undefined;
      const missingArg =
        issue?.missing === true &&
        Object.keys(command.contract.args).some((name) => schemaFieldName(name) === issue.path);
      Object.assign(error, {
        exitCode: 2,
        message: legacyValidationMessage(error, command, filtered),
        showCta: true,
        showHelp: missingArg,
      });
    }
    throw error;
  }
};

const formatHumanValidationError = (error: unknown, argv: string[]) => {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const showHelp = "showHelp" in normalized && normalized.showHelp === true;
  const showCta = showHelp || ("showCta" in normalized && normalized.showCta === true);
  let output = ` ›   Error: ${normalized.message}\n`;
  if (showCta) output += " ›   See more help with --help\n";
  if (showHelp) {
    output += "\n";
    const commandPath = resolveCommandPath(argv);
    const help = legacyHelp[commandPath]?.stdout;
    if (help) {
      output += help
        .replace(/^[\s\S]*?\n\n(?=USAGE\n)/, "")
        .replace(/\nDESCRIPTION\n[\s\S]*?(?=\n(?:EXAMPLES|COMMANDS|TOPICS)\n|$)/, "")
        .replace(/\nEXAMPLES\n[\s\S]*?(?=\n(?:COMMANDS|TOPICS)\n|$)/, "")
        .replace(
          /(^|\n)(COMMANDS)\n((?: {2}.*(?:\n|$))*)/g,
          (_match, prefix: string, title: string, body: string) =>
            `${prefix}${title}\n${body.replace(/^ {2}([a-z][\w:-]*)(?: {2,}.*)$/gm, "  $1")}`,
        )
        .replace(/\n+$/, "\n\n");
    }
  }
  return output;
};

export const renderHumanHelp = (output: string, argv: string[]) => {
  const commandPath = resolveCommandPath(argv);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  const isTopic =
    commandPath.length > 0 &&
    !command &&
    Object.keys(Commands).some((id) => id.startsWith(`${commandPath}:`));
  if (beforeDelimiter(argv).includes("--help") && legacyBuiltinHelp[commandPath]) {
    return legacyBuiltinHelp[commandPath];
  }
  if (
    (argv.length === 0 || beforeDelimiter(argv).includes("--help") || isTopic) &&
    legacyHelp[commandPath]
  ) {
    const output = legacyHelp[commandPath].stdout;
    if (commandPath) return output;
    return output.replace(
      /^ {2}@prismatic-io\/prism\/\S+ \S+ node-\S+$/m,
      `  ${packageJson.name}/${packageJson.version} ${process.platform}-${process.arch} node-${process.version}`,
    );
  }
  let result = output;
  for (const [id, command] of Object.entries(Commands).sort(
    ([left], [right]) => right.length - left.length,
  )) {
    result = result.replaceAll(`prism ${id.replaceAll(":", " ")}`, `prism ${id}`);
    for (const name of Object.keys(command.contract.options)) {
      const kebab = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      if (kebab !== name) result = result.replaceAll(`--${kebab}`, `--${name}`);
      if (name.startsWith("no-")) {
        const internal = schemaFieldName(name).replace(
          /[A-Z]/g,
          (letter) => `-${letter.toLowerCase()}`,
        );
        result = result.replaceAll(`--${internal}`, `--${name}`);
      }
    }
  }
  if (isTopic) {
    const childNames = new Set(
      Object.keys(Commands).flatMap((id) => {
        if (!id.startsWith(`${commandPath}:`)) return [];
        const child = id.slice(commandPath.length + 1).split(":", 1)[0];
        return child ? [child] : [];
      }),
    );
    const entries = [...childNames].map((child) => {
      const id = `${commandPath}:${child}`;
      const leaf = Object.entries(Commands).find(([commandId]) => commandId === id)?.[1];
      return { description: leaf?.description ?? topicDescriptions[id] ?? "", id, topic: !leaf };
    });
    const render = (title: string, values: typeof entries) => {
      if (values.length === 0) return "";
      const width = Math.max(...values.map(({ id }) => id.length));
      return `${title}\n${values
        .map(({ description, id }) => `  ${id.padEnd(width)}  ${description}`.trimEnd())
        .join("\n")}`;
    };
    return [
      topicDescriptions[commandPath] ?? "",
      `USAGE\n  $ prism ${commandPath}:COMMAND`,
      render(
        "TOPICS",
        entries.filter(({ topic }) => topic),
      ),
      render(
        "COMMANDS",
        entries.filter(({ topic }) => !topic),
      ),
    ]
      .filter(Boolean)
      .join("\n\n")
      .concat("\n");
  }
  if (command?.legacyExamples.length && result.includes("\nExamples:\n")) {
    const examples = command.legacyExamples
      .map(({ command: example, description }) => {
        const rendered = example
          .replaceAll("<%= config.bin %>", "prism")
          .replaceAll("<%= command.id %>", commandPath);
        return description ? `  ${description}\n    ${rendered}` : `  ${rendered}`;
      })
      .join("\n\n");
    result = result.replace(
      /\nExamples:\n[\s\S]*?(?=\n\n(?:Custom Global Options:|Global Options:|Pass ))/,
      `\nExamples:\n${examples}`,
    );
  }
  if (commandPath && result.includes("<command>")) {
    result = result.replace(
      `prism ${commandPath.replaceAll(":", " ")} <command>`,
      `prism ${commandPath}:COMMAND`,
    );
    const children = new Set(
      Object.keys(Commands).flatMap((id) => {
        if (!id.startsWith(`${commandPath}:`)) return [];
        const child = id.slice(commandPath.length + 1).split(":", 1)[0];
        return child ? [child] : [];
      }),
    );
    for (const child of children) {
      result = result.replace(
        new RegExp(`^  ${child}(\\s{2,})`, "m"),
        `  ${commandPath}:${child}$1`,
      );
    }
    const entries = [...children].map((child) => {
      const id = `${commandPath}:${child}`;
      const leaf = Object.entries(Commands).find(([commandId]) => commandId === id)?.[1];
      return { description: leaf?.description ?? topicDescriptions[id] ?? "", id, topic: !leaf };
    });
    const renderSection = (title: string, values: typeof entries) => {
      if (values.length === 0) return "";
      const width = Math.max(...values.map(({ id }) => id.length));
      return `${title}\n${values
        .map(({ description, id }) => `  ${id.padEnd(width)}  ${description}`.trimEnd())
        .join("\n")}`;
    };
    const topics = renderSection(
      "TOPICS",
      entries.filter(({ topic }) => topic),
    );
    const commands = renderSection(
      "COMMANDS",
      entries.filter(({ topic }) => !topic),
    );
    result = result.replace(
      /Commands:\n[\s\S]*?(?=\n\nCustom Global Options:)/,
      [topics, commands].filter(Boolean).join("\n\n"),
    );
  }
  result = result.replace(
    /^(\s*--agent\s+.*)$/m,
    "$1\n  --no-agent          Force human-readable output",
  );
  return result;
};

const wrapWithoutBreakSpace = (
  value: string,
  width: number,
  prefix: string,
  continuation: string,
) => {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = prefix;
  for (const word of words) {
    if (line !== prefix && line.length + word.length + 1 > width) {
      lines.push(line);
      line = `${continuation}${word}`;
    } else line = line === prefix ? `${line}${word}` : `${line} ${word}`;
  }
  if (line !== prefix) lines.push(line);
  return lines;
};

const renderHumanErrorOutput = (output: string, commandError: boolean) => {
  const systemError = /^Error: ([A-Z][A-Z0-9_]+):/.exec(output);
  if (systemError?.[1]) {
    return `    ${output.trimEnd()}\n    Code: ${systemError[1]}\n`;
  }
  if (!commandError) {
    return `${wrapWithoutBreakSpace(output, 80, "    ", "     ").join("\n")}\n`;
  }
  return `${wrapPreservingBreakSpace(` ›   ${output.trimEnd()}`, 80, " ›   ").join("\n")}\n`;
};

export const resolveAgentMode = (
  argv: string[],
  environment: NodeJS.ProcessEnv = process.env,
): boolean => {
  const delimiter = argv.indexOf("--");
  const prismArguments = delimiter < 0 ? argv : argv.slice(0, delimiter);
  const explicitModes = prismArguments.flatMap((value) => {
    const match = /^--(no-)?agent(?:=(true|false))?$/i.exec(value);
    if (!match) return [];
    const enabled = (match[1] === undefined) === (match[2]?.toLowerCase() !== "false");
    return [enabled];
  });
  const forceAgent = explicitModes.includes(true);
  const forceHuman = explicitModes.includes(false);
  if (forceAgent && forceHuman) throw new Error("--agent and --no-agent cannot be used together");
  if (forceAgent) return true;
  if (forceHuman) return false;
  if (truthy(environment.PRISM_NO_AGENT) || truthy(environment.FORCE_HUMAN_MODE)) return false;
  return agentEnvironmentVariables.some((name) => truthy(environment[name]));
};

export const serve = async (argv = process.argv.slice(2), environment = process.env) => {
  const agent = resolveAgentMode(argv, environment);
  const normalized = normalizeCommandArguments(argv);
  const prismArguments = beforeDelimiter(argv);
  const commandPath = resolveCommandPath(normalized);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  const hasLocalVersion = Boolean(command?.contract.options.version);
  if (
    !agent &&
    !hasLocalVersion &&
    (prismArguments.includes("--version") || prismArguments.includes("-v"))
  ) {
    process.stdout.write(
      `${packageJson.name}/${packageJson.version} ${process.platform}-${process.arch} node-${process.version}\n`,
    );
    return;
  }
  if (
    agent &&
    !normalized.some((value) => /^(?:--format(?:=|$)|--(?:json|jsonl|yaml|toon|md)$)/.test(value))
  ) {
    normalized.unshift("--format", "toon");
  }
  if (!agent) {
    try {
      assertCommandArity(normalized);
      if (normalized[0] !== "completions") validateHumanInvocation(normalized);
    } catch (error) {
      if (error && typeof error === "object") {
        Object.assign(error, { humanMessage: formatHumanValidationError(error, normalized) });
      }
      throw error;
    }
  } else assertCommandArity(normalized);
  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  let usageError = false;
  Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: !agent });
  try {
    consumeCommandExitCode();
    await cli.serve(normalized, {
      env: environment,
      exit: (code: number) => {
        process.exitCode = consumeCommandExitCode() ?? code;
      },
      stdout: (output: string) => {
        const humanError = !agent && output.startsWith("Error:");
        if (
          !agent &&
          /^Error: (?:.*not a command|Unknown flag|missing required|invalid value|.*cannot also be provided|.* requires |Exactly one)/i.test(
            output,
          )
        ) {
          usageError = true;
        }
        if (humanError) {
          process.stderr.write(
            renderHumanHelp(
              renderHumanErrorOutput(output, getRequestedCommandExitCode() !== undefined),
              normalized,
            ),
          );
        } else process.stdout.write(agent ? output : renderHumanHelp(output, normalized));
      },
    });
    const commandExitCode = consumeCommandExitCode();
    if (commandExitCode !== undefined) process.exitCode = commandExitCode;
    if (usageError) process.exitCode = 2;
  } finally {
    if (descriptor) Object.defineProperty(process.stdout, "isTTY", descriptor);
  }
};

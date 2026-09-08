import { Cli, Completions, Formatter, Parser, type z } from "incur";
import packageJson from "../package.json" with { type: "json" };
import {
  assertMutationAllowed,
  encodePassthroughArgument,
  runWithMcpTransport,
  schemaFieldName,
  globalOptions,
  environmentOptions,
  commandVars,
  commandMiddleware,
} from "./command.js";
import { NativeCommands as Commands } from "./index.js";

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

type PrismCommand = (typeof Commands)[keyof typeof Commands];
type Tree = { command?: PrismCommand; children: Map<string, Tree> };
const root: Tree = { children: new Map() };

export const mutatingCommandIds = new Set(
  Object.entries(Commands)
    .filter(([, command]) => command.mutates)
    .map(([id]) => id),
);
export const potentiallyDestructiveCommandIds = new Set(
  Object.entries(Commands)
    .filter(([, command]) => command.destructive && !command.mutates)
    .map(([id]) => id),
);

for (const [id, command] of Object.entries(Commands)) {
  let node = root;
  for (const segment of id.split(":")) {
    const next = node.children.get(segment) ?? { children: new Map() };
    node.children.set(segment, next);
    node = next;
  }
  node.command = command;
}

type MountedDefinition = Cli.create.Options<
  z.ZodObject | undefined,
  typeof environmentOptions,
  z.ZodObject | undefined,
  z.ZodType | undefined,
  typeof commandVars,
  typeof globalOptions
>;
type MountedCli = Cli.Cli<
  Record<never, never>,
  typeof commandVars,
  typeof environmentOptions,
  typeof globalOptions
>;
const mount = (name: string, node: Tree, path: string): MountedCli => {
  const description = node.command?.description ?? topicDescriptions[path];
  const cli = node.command
    ? // Commands retain concrete inferred handler types in their own modules. The
      // heterogeneous route tree erases those types only at this registration seam.
      Cli.create(name, { ...node.command, description } as unknown as MountedDefinition & {
        run: NonNullable<MountedDefinition["run"]>;
      })
    : Cli.create(name, {
        description,
        env: environmentOptions,
        globals: globalOptions,
        vars: commandVars,
      });
  for (const [childName, child] of node.children) {
    cli.command(mount(childName, child, path ? `${path}:${childName}` : childName));
  }
  return cli;
};

export const cli = Cli.create("prism", {
  description: packageJson.description,
  env: environmentOptions,
  globalAlias: {},
  globals: globalOptions,
  vars: commandVars,
  mcp: {
    instructions:
      "Manage Prismatic integrations and resources. Prefer read commands before destructive changes.",
    title: "Prismatic CLI",
  },
  outputPolicy: "all",
  version: packageJson.version,
});

cli.use(commandMiddleware);

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

const globalValueFlags = new Set([
  "--profile",
  "--format",
  "--filter-output",
  "--token-limit",
  "--token-offset",
]);

// Only a leading command position can introduce a route. In particular, flag
// values and positional arguments that happen to name commands are opaque.
const resolveRoute = (argv: string[]) => {
  let start = 0;
  while (start < argv.length && argv[start].startsWith("-") && argv[start] !== "--") {
    const token = argv[start++];
    if (globalValueFlags.has(token)) start += 1;
  }
  let node = root;
  const path: string[] = [];
  let end = start;
  while (end < argv.length) {
    const segments = argv[end].split(":");
    let candidate = node;
    for (const segment of segments) {
      const child = candidate.children.get(segment);
      if (!child) return { start, end, path: path.join(":"), command: node.command };
      candidate = child;
    }
    path.push(...segments);
    node = candidate;
    end += 1;
  }
  return { start, end, path: path.join(":"), command: node.command };
};

export const normalizeCommandArguments = (argv: string[]): string[] => {
  const delimiter = argv.indexOf("--");
  const tokens = [...(delimiter < 0 ? argv : argv.slice(0, delimiter))];
  if (tokens[0] === "help") {
    tokens.shift();
    tokens.push("--help");
  }
  const route = resolveRoute(tokens);
  const fields = new Map<string, { name: string; multiple?: boolean; kind: string }>();
  for (const [name, field] of Object.entries(route.command?.contract.options ?? {}) as [
    string,
    { char?: string; multiple?: boolean; kind: string },
  ][]) {
    const descriptor = { ...field, name };
    fields.set(`--${name}`, descriptor);
    fields.set(`--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, descriptor);
    if (field.char) fields.set(`-${field.char}`, descriptor);
  }
  const normalized: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    if (index === route.start && route.end > route.start) {
      normalized.push(...route.path.split(":"));
      index = route.end - 1;
      continue;
    }
    let token = tokens[index];
    const mode = /^--(no-)?agent=(true|false)$/i.exec(token);
    if (mode)
      token =
        (mode[1] === undefined) === (mode[2].toLowerCase() === "true") ? "--agent" : "--no-agent";
    let name = token.split("=", 1)[0];
    let field = fields.get(name);
    // Oclif permits attached short values, including after boolean aliases.
    if (/^-[^-].+/.test(token)) {
      for (let offset = 1; offset < token.length; offset += 1) {
        const short = `-${token[offset]}`;
        const shortField = fields.get(short);
        if (!shortField) break;
        if (shortField.kind === "boolean") {
          if (offset < token.length - 1) normalized.push(short);
          else token = short;
          continue;
        }
        const attached = token.slice(offset + 1);
        token = short;
        if (attached)
          tokens.splice(index + 1, 0, attached.startsWith("=") ? attached.slice(1) : attached);
        break;
      }
      name = token.split("=", 1)[0];
      field = fields.get(name);
    }
    if (name.startsWith("--no-no-") && fields.has(`--${name.slice(5)}`)) {
      throw Object.assign(new Error(`Unknown option: ${name}`), {
        exitCode: 2,
        code: "UNKNOWN_FLAG",
      });
    }
    // Command-owned aliases take priority over incur's global help shortcut.
    if (name === "-h" && field) token = `--${field.name}`;
    if (field && /[A-Z]/.test(name))
      token = token.replace(
        name,
        name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
      );
    if (globalValueFlags.has(name) && name !== "--profile" && token.includes("=")) {
      normalized.push(name, token.slice(token.indexOf("=") + 1));
    } else normalized.push(token);
    if ((field && field.kind !== "boolean") || globalValueFlags.has(name)) {
      if (!token.includes("=") && index + 1 < tokens.length) {
        const value = tokens[++index];
        // Keep incur's global flag extraction from interpreting an option value.
        if (value.startsWith("-") && value !== "--help" && field) {
          normalized[normalized.length - 1] =
            `--${field.name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}=${value}`;
        } else if (value.startsWith("--") && name === "--profile") {
          normalized[normalized.length - 1] = `${name}=${value}`;
        } else normalized.push(value);
      }
      if (field?.multiple) {
        while (index + 1 < tokens.length && !tokens[index + 1].startsWith("-")) {
          normalized.push(name, tokens[++index]);
        }
      }
    }
  }
  if (delimiter >= 0) {
    const rest = argv.slice(delimiter + 1);
    normalized.push(...rest.map(encodePassthroughArgument));
  }
  return normalized;
};

const resolveCommandPath = (argv: string[]): string => resolveRoute(argv).path;

// These routes belong to incur itself, including its singular skill alias.
const nativeRoutes = new Set(["completions", "mcp", "skills", "skill"]);
const isNativeRoute = (argv: string[]) => nativeRoutes.has(argv[resolveRoute(argv).start]);

const assertNativeMutationAllowed = (
  argv: string[],
  agent: boolean,
  environment: NodeJS.ProcessEnv,
) => {
  if (!isNativeRoute(argv)) return;
  const rootIndex = resolveRoute(argv).start;
  const route = argv[rootIndex];
  const globals: string[] = [];
  const words: string[] = [];
  let help = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const name = token.split("=", 1)[0];
    // Native option values are opaque, including strings that look like approval.
    const nativeValue =
      ["--command", "-c", "--depth"].includes(name) ||
      (name === "--agent" &&
        index > rootIndex &&
        argv[index + 1] &&
        !argv[index + 1].startsWith("-"));
    if (nativeValue || globalValueFlags.has(name)) {
      if (!token.includes("=")) index += 1;
      continue;
    }
    if (["--help", "-h"].includes(token)) help = true;
    if (/^--(?:no-)?(?:yes|read-only)(?:=|$)/.test(token)) globals.push(token);
    if (!token.startsWith("-")) words.push(token);
  }
  if (help || !["mcp", "skills", "skill"].includes(route) || words[1] !== "add") return;
  const parsed = Parser.parse(globals, { options: globalOptions }).options;
  assertMutationAllowed({
    agent,
    globals: { ...parsed, readOnly: parsed.readOnly || truthy(environment.PRISM_READ_ONLY) },
  });
};

const assertCommandArity = (argv: string[], agent: boolean) => {
  if (isNativeRoute(argv)) return;
  const commandPath = resolveCommandPath(argv);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  if (beforeDelimiter(argv).includes("--help")) return;
  if (
    optionTokens(argv).some((token) =>
      ["--help", "-h", "--schema", "--llms", "--llms-full", "--mcp"].includes(token),
    )
  )
    return;
  if (!command) {
    const route = resolveRoute(argv);
    const unexpected = argv[route.end];
    if (agent && unexpected && !unexpected.startsWith("-")) {
      throw Object.assign(new Error(`'${unexpected}' is not a command.`), {
        code: "COMMAND_NOT_FOUND",
        exitCode: 2,
      });
    }
    return;
  }
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
    if (field.kind === "boolean") fields.set(`--no-${internal}`, descriptor);
    if (field.char) fields.set(`-${field.char}`, descriptor);
  }
  for (const name of ["profile", "format", "filter-output", "token-limit", "token-offset"]) {
    fields.set(`--${name}`, { multiple: false, name, takesValue: true });
  }
  for (const name of [
    "agent",
    "print-requests",
    "quiet",
    "read-only",
    "yes",
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
  const values = argv.slice(routeStart + segments.length);
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index] ?? "";
    if (!token.startsWith("-")) {
      positionalCount += 1;
      continue;
    }
    const name = token.split("=", 1)[0] ?? token;
    const field = fields.get(name);
    if (!field) {
      if (["--json", "--mcp", "--version", "--update", "--update-check", "-h"].includes(name))
        continue;
      if (token === "--") {
        positionalCount += values.length - index - 1;
        break;
      }
      throw Object.assign(new Error(`Unknown flag: ${name}`), {
        code: "UNKNOWN_FLAG",
        exitCode: 2,
      });
    }
    if (!field.takesValue && token.includes("=")) {
      const positional = values.find((value) => !value.startsWith("-"));
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
    if (field.takesValue && !token.includes("=")) {
      if (index + 1 >= values.length) {
        throw Object.assign(new Error(`Missing value for flag: ${name}`), {
          code: "VALIDATION_ERROR",
          exitCode: 2,
        });
      }
      index += 1;
    }
  }
  if (!args.at(-1)?.multiple && positionalCount > args.length) {
    const error = new Error(`Unexpected argument: ${values.at(-1)}`);
    Object.assign(error, { exitCode: 2, showHelp: true });
    throw error;
  }
  if (!agent) return;
  const localArguments: string[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    const field = fields.get(token.split("=", 1)[0]);
    if (!token.startsWith("-") || (field && Object.hasOwn(command.contract.options, field.name))) {
      localArguments.push(token);
      if (field?.takesValue && !token.includes("=") && index + 1 < values.length)
        localArguments.push(values[++index]);
    } else if (field?.takesValue && !token.includes("=")) index += 1;
  }
  try {
    Parser.parse(localArguments, {
      alias: command.alias,
      args: command.args,
      options: command.options,
    });
  } catch (error) {
    if (error instanceof Error) Object.assign(error, { code: "VALIDATION_ERROR", exitCode: 2 });
    throw error;
  }
};

// Select switches without mistaking the value of another option for a switch.
const optionTokens = (argv: string[]) => {
  const tokens = beforeDelimiter(argv);
  const route = resolveRoute(tokens);
  const valueFlags = new Set(globalValueFlags);
  for (const [name, field] of Object.entries(route.command?.contract.options ?? {}) as [
    string,
    { kind: string; char?: string },
  ][]) {
    if (field.kind === "boolean") continue;
    valueFlags.add(`--${name}`);
    valueFlags.add(`--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
    if (field.char) valueFlags.add(`-${field.char}`);
  }
  const result: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith("-")) result.push(token);
    if (valueFlags.has(token)) index += 1;
  }
  return result;
};

export const resolveAgentMode = (
  argv: string[],
  environment: NodeJS.ProcessEnv = process.env,
): boolean => {
  const prismArguments = optionTokens(argv);
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

const writeAgentUsageError = (error: unknown, argv: string[]) => {
  const tokens = argv;
  const message = error instanceof Error ? error.message : String(error);
  const explicitFormat = tokens.find((value) => /^--(?:json|jsonl|yaml|toon|md)$/.test(value));
  const formatIndex = tokens.indexOf("--format");
  const inlineFormat = tokens.find((value) => value.startsWith("--format="))?.slice(9);
  const format = (inlineFormat ??
    (formatIndex >= 0 ? tokens[formatIndex + 1] : undefined) ??
    explicitFormat?.slice(2) ??
    "toon") as Formatter.Format;
  const code =
    error && typeof error === "object" && "code" in error ? error.code : "VALIDATION_ERROR";
  process.stdout.write(Formatter.format({ code, message }, format));
  process.exitCode = 2;
};

/** Capture only real launch globals; builtin option values may resemble flags. */
export const parseMcpLaunchGlobals = (
  argv: string[],
  environment: NodeJS.ProcessEnv = process.env,
) => {
  const tokens = beforeDelimiter(argv);
  const selected: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const name = token.split("=", 1)[0];
    // These are incur output controls, not custom globals. Their values are opaque.
    if (globalValueFlags.has(name) && name !== "--profile") {
      if (!token.includes("=")) index += 1;
      continue;
    }
    selected.push(token);
    if (name === "--profile" && !token.includes("=") && index + 1 < tokens.length)
      selected.push(tokens[++index]);
  }
  const globals = Parser.parseGlobals(selected, globalOptions).parsed;
  return { ...globals, readOnly: globals.readOnly || truthy(environment.PRISM_READ_ONLY) };
};

export const serve = async (argv = process.argv.slice(2), environment = process.env) => {
  // Shell hooks pass an argv-shaped payload after --. It is a completion
  // protocol, not an invocation; preserve it before any compatibility parsing.
  if (environment.COMPLETE) {
    const separator = argv.indexOf("--");
    const words = separator < 0 ? argv : argv.slice(separator + 1);
    const index = Number(environment._COMPLETE_INDEX ?? words.length - 1);
    const current = words[index] ?? "";
    if (index === 1 && current.includes(":")) {
      const candidates = Object.entries(Commands)
        .filter(([id]) => id.startsWith(current))
        .map(([value, command]) => ({ value, description: command.description }));
      const output = Completions.format(
        environment.COMPLETE as Parameters<typeof Completions.format>[0],
        candidates,
      );
      if (output) process.stdout.write(output);
      return;
    }
    let completionArgv = argv;
    const oldIndex = process.env._COMPLETE_INDEX;
    try {
      // A completed legacy colon route still supplies its local flags to incur.
      if (index > 1 && Object.hasOwn(Commands, words[1] ?? "") && words[1].includes(":")) {
        const segments = words[1].split(":");
        completionArgv = ["--", words[0], ...segments, ...words.slice(2)];
        process.env._COMPLETE_INDEX = String(index + segments.length - 1);
      }
      await cli.serve(completionArgv, {
        env: environment,
        stdout: (output: string) => process.stdout.write(output),
        exit: (code: number) => {
          process.exitCode = code;
        },
      });
    } finally {
      if (oldIndex === undefined) delete process.env._COMPLETE_INDEX;
      else process.env._COMPLETE_INDEX = oldIndex;
    }
    return;
  }
  const agent = resolveAgentMode(argv, environment);
  let normalized: string[];
  try {
    normalized = isNativeRoute(argv) ? argv : normalizeCommandArguments(argv);
  } catch (error) {
    if (!agent) throw error;
    writeAgentUsageError(error, argv);
    return;
  }
  const prismArguments = optionTokens(argv);
  const commandPath = resolveCommandPath(normalized);
  const command = Object.entries(Commands).find(([id]) => id === commandPath)?.[1];
  const hasLocalVersionAlias = Object.values(command?.contract.options ?? {}).some(
    (field) => field.char === "v",
  );
  // Preserve Prism's global short version flag while letting incur render it.
  if (!hasLocalVersionAlias && prismArguments.includes("-v")) {
    normalized = normalized.map((token) => (token === "-v" ? "--version" : token));
  }
  try {
    assertNativeMutationAllowed(normalized, agent, environment);
    assertCommandArity(normalized, agent);
  } catch (error) {
    if (!agent) throw error;
    writeAgentUsageError(error, normalized);
    return;
  }
  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  let usageError = false;
  Object.defineProperty(process.stdout, "isTTY", {
    configurable: true,
    value: !agent,
  });
  try {
    const invoke = () =>
      cli.serve(normalized, {
        env: environment,
        exit: (code: number) => {
          process.exitCode = code;
        },
        stdout: (output: string) => {
          const renderedOutput =
            agent && /code: UNKNOWN\b[\s\S]*Unknown flag:/i.test(output)
              ? output.replace(/code: UNKNOWN\b/, "code: UNKNOWN_FLAG")
              : output;
          const humanError = !agent && /^Error(?: \([^\n)]*\))?:/.test(renderedOutput);
          if (
            /^Error: (?:.*not a command|Unknown flag|missing required|invalid value|.*cannot also be provided|.* requires |Exactly one)/i.test(
              renderedOutput,
            ) ||
            (agent &&
              /code: (?:COMMAND_NOT_FOUND|UNKNOWN_FLAG|VALIDATION_ERROR)\b/i.test(renderedOutput))
          ) {
            usageError = true;
          }
          if (humanError) {
            process.stderr.write(renderedOutput);
          } else process.stdout.write(renderedOutput);
        },
      });
    await (prismArguments.includes("--mcp")
      ? runWithMcpTransport(invoke, parseMcpLaunchGlobals(normalized, environment))
      : invoke());
    if (usageError) process.exitCode = 2;
  } finally {
    if (descriptor) Object.defineProperty(process.stdout, "isTTY", descriptor);
  }
};

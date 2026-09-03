import { Cli, z } from "incur";
import packageJson from "../package.json" with { type: "json" };
import { Commands } from "./index.js";
import { consumeCommandExitCode, encodePassthroughArgument, schemaFieldName } from "./command.js";

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

export const renderHumanHelp = (output: string, _argv: string[]) => {
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
  result = result.replace(
    /^(\s*--agent\s+.*)$/m,
    "$1\n  --no-agent          Force human-readable output",
  );
  return result;
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
  assertCommandArity(normalized);
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
          process.stderr.write(renderHumanHelp(output, normalized));
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

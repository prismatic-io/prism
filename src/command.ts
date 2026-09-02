import { z } from "incur";
import { AsyncLocalStorage } from "node:async_hooks";
import { selectProfile } from "./config.js";
import { useDefaultAuthContext, useProfileAuthContext } from "./context.js";
import { validateFlags } from "./utils/validation.js";

export type FieldConfig<T> = {
  [key: string]: unknown;
  char?: string;
  default?: T;
  dependsOn?: string[];
  description?: string;
  exclusive?: string[];
  hidden?: boolean;
  multiple?: boolean;
  options?: readonly T[];
  required?: boolean;
};

export type Field<T = unknown> = FieldConfig<T> & {
  kind: "boolean" | "integer" | "string";
};

const field = <T>(kind: Field<T>["kind"], config: FieldConfig<T> = {}): Field<T> => ({
  kind,
  ...config,
});

export const arg = {
  boolean: (config: FieldConfig<boolean> = {}) => field("boolean", config),
  string: (config: FieldConfig<string> = {}) => field("string", config),
};

export const option = {
  boolean: (config: FieldConfig<boolean> = {}) => field("boolean", config),
  integer: (config: FieldConfig<number> = {}) => field("integer", config),
  string: (config: FieldConfig<string> = {}) => field("string", config),
  custom:
    <T extends string>(config: FieldConfig<T> = {}) =>
    () =>
      field("string", config),
};

export type Fields = Record<string, Field>;

export const schemaFieldName = (name: string) =>
  name.startsWith("no-")
    ? `legacyNo${name
        .slice(3)
        .split("-")
        .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
        .join("")}`
    : name;

const passthroughPrefix = "__PRISM_PASSTHROUGH__";
export const encodePassthroughArgument = (value: string) =>
  `${passthroughPrefix}${Buffer.from(value).toString("base64url")}`;
export const decodePassthroughArgument = (value: string) =>
  value.startsWith(passthroughPrefix)
    ? Buffer.from(value.slice(passthroughPrefix.length), "base64url").toString()
    : value;

const schemaFor = (definition: Field, positional = false): z.ZodType => {
  let schema: z.ZodType;
  if (definition.kind === "boolean") {
    schema = positional
      ? z.string().transform((value) => !["0", "false", "n", "no"].includes(value.toLowerCase()))
      : z.boolean();
  } else if (definition.kind === "integer") schema = z.coerce.number().int();
  else if (definition.options) {
    const values = definition.options.filter((value): value is string => typeof value === "string");
    schema = values.length > 0 ? z.enum(values) : z.string();
  } else schema = z.string();

  if (definition.multiple) schema = z.array(schema);
  if (definition.default !== undefined) schema = schema.default(definition.default);
  else if (!definition.required) schema = schema.optional();
  if (definition.description) schema = schema.describe(definition.description);
  return schema;
};

const objectSchema = (fields?: Fields, positional = false) => {
  if (!fields) return undefined;
  return z
    .object(
      Object.fromEntries(
        Object.entries(fields).map(([name, value]) => [
          schemaFieldName(name),
          schemaFor(value, positional),
        ]),
      ),
    )
    .superRefine((values, context) => {
      const legacyValues = Object.fromEntries(
        Object.keys(fields).map((name) => [name, values[schemaFieldName(name)]]),
      );
      for (const [name, definition] of Object.entries(fields)) {
        const exactlyOne = Array.isArray(definition.exactlyOne)
          ? definition.exactlyOne.filter((value): value is string => typeof value === "string")
          : undefined;
        const exactlyOneNames = exactlyOne ? [...new Set([name, ...exactlyOne])] : undefined;
        if (
          exactlyOneNames &&
          exactlyOneNames.filter((key) => legacyValues[key] !== undefined).length !== 1
        ) {
          context.addIssue({
            code: "custom",
            message: `Exactly one of ${exactlyOneNames.map((key) => `--${key}`).join(", ")} is required`,
            path: [schemaFieldName(name)],
          });
        }
        if (legacyValues[name] === undefined) continue;
        for (const exclusive of definition.exclusive ?? []) {
          if (legacyValues[exclusive] !== undefined) {
            context.addIssue({
              code: "custom",
              message: `--${name} cannot also be provided when using --${exclusive}`,
              path: [schemaFieldName(name)],
            });
          }
        }
        for (const dependency of definition.dependsOn ?? []) {
          if (legacyValues[dependency] === undefined) {
            context.addIssue({
              code: "custom",
              message: `--${name} requires --${dependency}`,
              path: [schemaFieldName(name)],
            });
          }
        }
      }
    });
};

const aliases = (fields?: Fields) =>
  fields
    ? Object.fromEntries(
        Object.entries(fields).flatMap(([name, value]) =>
          value.char ? [[schemaFieldName(name), value.char]] : [],
        ),
      )
    : undefined;

export type CommandContext = {
  agent: boolean;
  args: Record<string, any>;
  formatExplicit: boolean;
  globals: Record<string, any>;
  options: Record<string, any>;
};

type CommandExecution = {
  context: CommandContext;
  emit?: (value: string, stream: "stdout" | "stderr") => void;
  output: string[];
};
const commandContext = new AsyncLocalStorage<CommandExecution>();
let requestedExitCode: number | undefined;

export const requestCommandExitCode = (code: number) => {
  requestedExitCode = code;
};

export const getRequestedCommandExitCode = () => requestedExitCode;

export const consumeCommandExitCode = () => {
  const code = requestedExitCode;
  requestedExitCode = undefined;
  return code;
};

export const commandInput = () => {
  const execution = commandContext.getStore();
  if (!execution) throw new Error("Command input is unavailable outside a command invocation");
  return {
    args: execution.context.args,
    argv: process.argv.slice(2),
    flags: execution.context.options,
  };
};

export const writeCommandOutput = (value: string, stream: "stdout" | "stderr" = "stdout") => {
  const execution = commandContext.getStore();
  const structuredValue = value.replace(/\n$/, "");
  if (execution && stream === "stdout") execution.output.push(structuredValue);
  execution?.emit?.(structuredValue, stream);
  if (!execution?.context.agent) {
    const target = stream === "stderr" ? process.stderr : process.stdout;
    target.write(`${value}\n`);
  }
};

export const writeCommandProgress = (value: string) => {
  const execution = commandContext.getStore();
  if (!execution?.context.agent) process.stdout.write(value);
};

export const isAgentExecution = () => commandContext.getStore()?.context.agent === true;

export const requireInteractiveInput = (message: string) => {
  if (isAgentExecution()) {
    throw Object.assign(new Error(message), { exitCode: 2 });
  }
};

const contextFromArgv = (definition: CommandDefinition, argv: string[]): CommandContext => {
  const options: Record<string, unknown> = {};
  const globals: Record<string, unknown> = {};
  const positional: string[] = [];
  const optionAliases = new Map(
    Object.entries(definition.options ?? {}).flatMap(([name, value]) =>
      value.char ? [[value.char, name] as const] : [],
    ),
  );
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("-")) {
      if (token !== undefined) positional.push(token);
      continue;
    }
    const [rawName, inlineValue] = token.replace(/^-+/, "").split("=", 2);
    const negated = rawName.startsWith("no-");
    const candidate = negated ? rawName.slice(3) : rawName;
    const name = optionAliases.get(candidate) ?? candidate;
    const field = definition.options?.[name];
    if (!field) {
      if (name === "profile") globals.profile = inlineValue ?? argv[++index];
      else if (name === "quiet") globals.quiet = !negated;
      else if (name === "print-requests") globals.printRequests = !negated;
      continue;
    }
    let value: unknown;
    if (field.kind === "boolean") value = !negated;
    else {
      value = inlineValue ?? argv[++index];
      if (field.kind === "integer") value = Number(value);
    }
    if (field.multiple) {
      const current = options[name];
      const values = Array.isArray(current) ? current : [];
      values.push(value);
      options[name] = values;
    } else options[name] = value;
  }
  for (const [name, field] of Object.entries(definition.options ?? {})) {
    if (options[name] === undefined && field.default !== undefined) options[name] = field.default;
  }
  const args = Object.fromEntries(
    Object.keys(definition.args ?? {}).map((name, index) => [name, positional[index]]),
  );
  return {
    agent: false,
    args,
    formatExplicit: false,
    globals,
    options,
  };
};

type CommandDefinition = {
  args?: Fields;
  authContext?: "default" | "profile";
  description?: string;
  examples?: Array<{ command: string; description?: string }>;
  options?: Fields;
  output?: z.ZodType;
  run(context: CommandContext): unknown | Promise<unknown> | AsyncGenerator<unknown>;
  [key: string]: unknown;
};

const exampleTokens = (command: string) =>
  command
    .split("\n", 1)[0]
    .replace(/^<%= config\.bin %>\s+<%= command\.id %>\s*/, "")
    .match(/"[^"]*"|'[^']*'|\S+/g)
    ?.map((token) => token.replace(/^(["'])(.*)\1$/, "$2")) ?? [];

const incurExamples = (definition: CommandDefinition) =>
  definition.examples?.map((example) => {
    const tokens = exampleTokens(example.command);
    const args: Record<string, string> = {};
    const options: Record<string, unknown> = {};
    const positional = Object.keys(definition.args ?? {});
    let positionalIndex = 0;
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token.startsWith("--")) {
        const [name, inline] = token.slice(2).split("=", 2);
        const field = definition.options?.[name];
        const value = field?.kind === "boolean" ? true : (inline ?? tokens[++index]);
        if (field?.multiple) {
          const current = options[name];
          const values = Array.isArray(current) ? current : [];
          values.push(value);
          options[name] = values;
        } else options[name] = value;
      } else if (positional[positionalIndex]) args[positional[positionalIndex++]] = token;
    }
    return {
      args,
      description: example.description,
      options,
    };
  });

export const defineCommand = <T extends CommandDefinition>(definition: T) => {
  const args = objectSchema(definition.args, true);
  const options = objectSchema(definition.options);
  const alias = aliases(definition.options);
  const originalRun = definition.run;

  const execute = async (
    context: CommandContext,
    emit?: (value: string, stream: "stdout" | "stderr") => void,
  ) => {
    context.options = Object.fromEntries(
      Object.keys(definition.options ?? {}).map((name) => [
        name,
        context.options[schemaFieldName(name)] ?? context.options[name],
      ]),
    );
    const configuredProfile = context.globals.profile ?? process.env.PRISM_PROFILE;
    const profile = typeof configuredProfile === "string" ? configuredProfile : undefined;
    selectProfile(profile);
    if (definition.authContext === "profile") useProfileAuthContext();
    else useDefaultAuthContext();
    if (context.globals.printRequests === true) process.env.PRISMATIC_PRINT_REQUESTS = "true";
    else delete process.env.PRISMATIC_PRINT_REQUESTS;
    if (context.globals.quiet === true) process.env.PRISM_QUIET = "true";
    else delete process.env.PRISM_QUIET;
    const execution: CommandExecution = { context, emit, output: [] };
    return commandContext.run(execution, async () => {
      const result = await originalRun.call(command, context);
      return result === undefined ? { output: execution.output } : result;
    });
  };

  const stream = async function* (context: CommandContext) {
    const pending: Array<{ stream: "stdout" | "stderr"; value: string }> = [];
    let wake: (() => void) | undefined;
    let settled = false;
    let failure: unknown;
    let result: unknown;
    const completed = execute(context, (value, outputStream) => {
      pending.push({ stream: outputStream, value });
      wake?.();
      wake = undefined;
    })
      .then((value) => {
        result = value;
      })
      .catch((error: unknown) => {
        failure = error;
      })
      .finally(() => {
        settled = true;
        wake?.();
      });

    while (!settled || pending.length > 0) {
      if (pending.length === 0) await new Promise<void>((resolve) => (wake = resolve));
      const chunk = pending.shift();
      if (chunk !== undefined) {
        yield chunk.stream === "stderr" ? { warnings: [chunk.value] } : { output: [chunk.value] };
      }
    }
    await completed;
    if (failure) {
      if (
        !context.agent &&
        typeof failure === "object" &&
        failure !== null &&
        "exitCode" in failure &&
        typeof failure.exitCode === "number"
      ) {
        process.exitCode = failure.exitCode;
      }
      throw failure;
    }
    if (pending.length === 0 && result && (typeof result !== "object" || !("output" in result))) {
      yield result;
    }
  };

  const command = {
    ...definition,
    args,
    contract: { args: definition.args ?? {}, options: definition.options ?? {} },
    examples: incurExamples(definition),
    legacyExamples: definition.examples ?? [],
    options,
    alias,
    output:
      definition.output ??
      z.union([
        z.object({ output: z.array(z.string()) }),
        z.object({ items: z.array(z.unknown()) }),
        z.object({ warnings: z.array(z.string()) }),
      ]),
    outputPolicy: "agent-only" as const,
    run(input: CommandContext | string[]) {
      const context = Array.isArray(input) ? contextFromArgv(definition, input) : input;
      return Array.isArray(input) ? execute(context) : stream(context);
    },
    async invoke(options: Record<string, unknown>, ..._ignored: unknown[]) {
      const context: CommandContext = {
        agent: false,
        args: {},
        formatExplicit: false,
        globals: {},
        options,
      };
      return commandContext.run({ context, output: [] }, () => originalRun.call(command, context));
    },
  };

  return command;
};

export const commandOutput = {
  error(message: string | Error, options?: { exit?: number }): never {
    const error = typeof message === "string" ? new Error(message) : message;
    const exitCode = options?.exit ?? 2;
    requestCommandExitCode(exitCode);
    Object.assign(error, { exitCode });
    throw error;
  },
  exit(code = 0): never {
    const error = new Error(`Exited with status ${code}`);
    Object.assign(error, { exitCode: code, silent: true });
    throw error;
  },
  log(...values: unknown[]): void {
    writeCommandOutput(
      values.map((value) => (value === undefined || value === null ? "" : String(value))).join(" "),
    );
  },
  logJson(value: unknown): void {
    writeCommandOutput(JSON.stringify(value, null, 2));
  },
  quietLog(message: string, quiet = false, type?: "warn"): void {
    if (quiet) return;
    writeCommandOutput(message, type === "warn" ? "stderr" : "stdout");
  },
  stderr(...values: unknown[]): void {
    writeCommandOutput(values.map(String).join(" "), "stderr");
  },
  warn(...messages: Array<string | Error>): void {
    writeCommandOutput(
      messages.map((message) => (message instanceof Error ? message.message : message)).join(" "),
      "stderr",
    );
  },
};

export const parseWithSchema = <T extends z.ZodType>(schema: T, context: CommandContext) => ({
  args: context.args,
  flags: validateFlags(schema, { ...context.options, quiet: context.globals.quiet }),
});

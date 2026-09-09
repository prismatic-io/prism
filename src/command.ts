import { prepareCta } from "./output.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { z, Errors, middleware, type Cli } from "incur";
import { getRuntimeEnvironment, runWithRuntimeState, type RuntimeState } from "./runtime.js";
import { globalOptions, environmentOptions } from "./command-schemas.js";
import {
  fieldsFromSchema,
  isMcpTransport,
  getMcpGlobals,
  decodeCliArguments,
  applyLegacyOptionConstraints,
} from "./compatibility.js";
export { globalOptions, environmentOptions } from "./command-schemas.js";
export {
  schemaFieldName,
  encodePassthroughArgument,
  decodePassthroughArgument,
  runWithMcpTransport,
  type Field,
  type Fields,
} from "./compatibility.js";

type Execution = {
  agent: boolean;
  globals: z.output<typeof globalOptions>;
  request?: Request;
  mcp?: boolean;
  signal: AbortSignal;
  warnings: string[];
  runtime: RuntimeState;
};
export const commandVars = z.object({
  execution: z.custom<Execution>().optional(),
  signal: z.custom<AbortSignal>().optional(),
});
type NativeOptions<
  A extends z.ZodObject | undefined = undefined,
  O extends z.ZodObject | undefined = undefined,
  R extends z.ZodType | undefined = undefined,
> = Cli.create.Options<
  A,
  typeof environmentOptions,
  O,
  R,
  typeof commandVars,
  typeof globalOptions
>;
export type CommandContext = Omit<
  Parameters<NonNullable<NativeOptions<z.ZodObject, z.ZodObject>["run"]>>[0],
  "ok"
> & { request?: Request };
const executionContext = new AsyncLocalStorage<Execution>();
export const commandMiddleware = middleware<
  typeof commandVars,
  typeof environmentOptions,
  typeof globalOptions
>(async (c, next) => {
  const abort = new AbortController();
  const signal = c.request?.signal
    ? AbortSignal.any([c.request.signal, abort.signal])
    : abort.signal;
  const runtime: RuntimeState = {
    environment: { ...process.env, ...c.env },
    printRequests: c.globals.printRequests === true,
    profileOnly: false,
    quiet: c.globals.quiet,
    selectedProfile: c.globals.profile ?? c.env.PRISM_PROFILE,
  };
  const execution: Execution = {
    agent: c.agent,
    globals: c.globals,
    request: c.request,
    signal,
    warnings: [],
    runtime,
  };
  c.set("execution", execution);
  c.set("signal", signal);
  try {
    await executionContext.run(execution, () => runWithRuntimeState(runtime, next));
  } finally {
    abort.abort();
  }
});

export const isCommandTransportExecution = () =>
  isMcpTransport() ||
  Boolean(executionContext.getStore()?.request || executionContext.getStore()?.mcp);
export const assertCommandStdinAvailable = (): void => {
  if (isCommandTransportExecution())
    throw new Errors.IncurError({
      code: "STDIN_UNAVAILABLE",
      exitCode: 2,
      message: "Standard input is reserved for the transport. Provide an argument or file instead.",
    });
};
export const commandSignal = () => executionContext.getStore()?.signal;
export const isAgentExecution = () => executionContext.getStore()?.agent === true;
export const commandGlobals = (): Partial<z.output<typeof globalOptions>> =>
  executionContext.getStore()?.globals ?? {};
export const commandWarnings = () => [...(executionContext.getStore()?.warnings ?? [])];
export const writeCommandOutput = (value: string, stream: "stdout" | "stderr" = "stdout") => {
  const execution = executionContext.getStore();
  if (stream === "stderr") execution?.warnings.push(value.replace(/\n$/, ""));
  if (!execution?.agent)
    (stream === "stderr" ? process.stderr : process.stdout).write(`${value}\n`);
};
export const writeCommandStatus = (value: string) => {
  if (!isAgentExecution()) process.stderr.write(`${value}\n`);
};
export const writeCommandProgress = (value: string) => {
  if (!isAgentExecution()) process.stderr.write(value);
};
export const requireInteractiveInput = (message: string) => {
  if (isAgentExecution())
    throw new Errors.IncurError({ code: "INTERACTIVE_INPUT_REQUIRED", message, exitCode: 2 });
};

type Definition<
  A extends z.ZodObject | undefined,
  O extends z.ZodObject | undefined,
  R extends z.ZodType | undefined,
> = Omit<NativeOptions<A, O, R>, "run" | "mcp"> & {
  run: NonNullable<NativeOptions<A, O, R>["run"]>;
  authContext?: "default" | "profile";
  mutates?: boolean;
  hidden?: boolean;
  mcp?: Cli.FileCommand["mcp"];
  middleware?: Cli.FileCommand["middleware"];
};

// Incur's MCP transport exposes command inputs but does not forward CLI globals.
// Namespace tool controls to avoid native global/option collisions (upstream issue #229).
const toolGlobals = z.object({
  yes: globalOptions.shape.yes.unwrap().optional(),
  readOnly: globalOptions.shape.readOnly.unwrap().optional(),
  quiet: globalOptions.shape.quiet.unwrap().optional(),
  profile: globalOptions.shape.profile,
  printRequests: globalOptions.shape.printRequests,
});

const preparedCommands = new WeakMap<object, unknown>();
export const preparedCommand = <T>(command: T): T =>
  (preparedCommands.get(command as object) ?? command) as T;

/** Apply Prism transport and public argv policies at registration, outside native command modules. */
export function applyCommandPolicy<
  const A extends z.ZodObject | undefined = undefined,
  const O extends z.ZodObject | undefined = undefined,
  const R extends z.ZodType | undefined = undefined,
>(
  definition: Definition<A, O, R>,
  policy: Pick<Definition<A, O, R>, "mutates" | "hidden" | "authContext"> = {},
) {
  const original = definition;
  definition = { ...definition, ...policy };
  const contract = {
    args: fieldsFromSchema(definition.args),
    options: fieldsFromSchema(definition.options),
  };
  for (const [name, char] of Object.entries(definition.alias ?? {})) {
    const field = contract.options[name];
    if (field) field.char = char as string;
  }
  const alias = Object.fromEntries(
    Object.entries(contract.options).flatMap(([name, field]) =>
      field.char ? [[name.startsWith("no-") ? name.slice(3) : name, field.char]] : [],
    ),
  );
  const scope = middleware<typeof commandVars, typeof environmentOptions, typeof globalOptions>(
    async (c, next) => {
      if (!c.var.execution) throw new Error("Command middleware is not installed");
      c.var.execution.runtime.profileOnly = definition.authContext === "profile";
      await next();
    },
  );
  const run: NonNullable<NativeOptions<A, O, R>["run"]> = (context) => {
    const execution = context.var.execution;
    if (!execution) throw new Error("Command middleware is not installed");
    // MCP passes globals as flat tool inputs. Resolve them before any handler work;
    // a server launched read-only remains read-only even if a call supplies false.
    if (Object.keys(context.globals).length === 0) {
      execution.mcp = true;
      const inherited = getMcpGlobals();
      const provided = toolGlobals.parse(
        (context.options as Record<string, unknown>).context ?? {},
      );
      const explicit = Object.fromEntries(
        Object.entries(provided).filter(([, value]) => value !== undefined),
      );
      context.globals = globalOptions.parse({
        ...inherited,
        ...explicit,
        readOnly: inherited.readOnly === true || provided.readOnly === true,
      });
      execution.globals = context.globals;
      execution.runtime.selectedProfile =
        context.globals.profile ?? execution.runtime.environment?.PRISM_PROFILE;
      execution.runtime.quiet = context.globals.quiet;
      execution.runtime.printRequests = context.globals.printRequests === true;
    }
    if (definition.mutates) assertMutationAllowed(context);
    const abort = new AbortController();
    const signal = AbortSignal.any([execution.signal, abort.signal]);
    const local = { ...execution, signal };
    context.var.signal = signal;
    const within = <T>(fn: () => T) =>
      executionContext.run(local, () => runWithRuntimeState(local.runtime, fn));
    const inspect = <T>(value: T, streaming = false): T => {
      const tagged =
        value && typeof value === "object" ? (value as Record<PropertyKey, unknown>) : undefined;
      const tag = tagged?.[Symbol.for("incur.sentinel")];
      if (tag === "error") {
        if (streaming) throw nativeError(tagged);
        return {
          ...tagged,
          ...(tagged?.cta ? { cta: prepareCta(tagged.cta, context.globals.profile) } : {}),
        } as T;
      }
      let data = tag === "ok" ? tagged?.data : value;
      const warnings = commandWarnings();
      if (
        definition.output &&
        warnings.length &&
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      )
        data = { ...data, warnings };
      const result = (parsed: unknown) =>
        (tag === "ok"
          ? {
              ...tagged,
              data: parsed,
              ...(tagged?.cta ? { cta: prepareCta(tagged.cta, context.globals.profile) } : {}),
            }
          : parsed) as T;
      if (definition.output) {
        const parsed = definition.output.safeParse(data);
        if (!parsed.success)
          throw new Errors.IncurError({
            code: "OUTPUT_SCHEMA_MISMATCH",
            message: parsed.error.message,
            exitCode: 1,
          });
        return result(parsed.data);
      }
      return result(data);
    };
    try {
      const result = within(() => definition.run(context));
      if (result && typeof result === "object" && Symbol.asyncIterator in result) {
        // Bind iterator operations, not an output collector. Return aborts even while next waits.
        const iterator = result;
        const bound: typeof iterator = {
          [Symbol.asyncIterator]() {
            return this;
          },
          async [Symbol.asyncDispose]() {
            abort.abort();
            await within(() => iterator.return(undefined));
          },
          async next(...args: [] | [unknown]) {
            try {
              const step = await within(() => iterator.next(...args));
              if (step.done) {
                if (step.value !== undefined) step.value = inspect(step.value, true);
                abort.abort();
              } else step.value = inspect(step.value, true);
              return step;
            } catch (error) {
              abort.abort();
              await within(() => iterator.return(undefined));
              throw nativeError(error);
            }
          },
          async return(value: unknown) {
            abort.abort();
            return within(() => iterator.return(value));
          },
          async throw(error: unknown) {
            abort.abort();
            return within(() => iterator.throw(error));
          },
        };
        return bound;
      }
      return Promise.resolve(result)
        .then(inspect)
        .catch((error) => {
          throw nativeError(error);
        })
        .finally(() => abort.abort());
    } catch (error) {
      abort.abort();
      throw nativeError(error);
    }
  };
  const prepared = {
    ...definition,
    args: definition.args ? decodeCliArguments(definition.args) : undefined,
    env: definition.env ?? environmentOptions,
    contract,
    options: definition.options
      ? applyLegacyOptionConstraints(definition.options).safeExtend({
          context: toolGlobals
            .optional()
            .describe("MCP execution controls; CLI users use global flags"),
        })
      : z.object({
          context: toolGlobals
            .optional()
            .describe("MCP execution controls; CLI users use global flags"),
        }),
    alias,
    run,
    middleware: [scope, ...(definition.middleware ?? [])],
    destructive: definition.mutates === true || definition.destructive === true,
    mcp: definition.mcp ?? {
      annotations: {
        destructiveHint: definition.mutates === true || definition.destructive === true,
        idempotentHint: !(definition.mutates || definition.destructive),
        openWorldHint: true,
        readOnlyHint: !(definition.mutates || definition.destructive),
      },
    },
  };
  preparedCommands.set(original, prepared);
  preparedCommands.set(prepared, prepared);
  return prepared;
}
export function prepareCommand<
  const A extends z.ZodObject | undefined,
  const O extends z.ZodObject | undefined,
  const R extends z.ZodType | undefined,
>(
  definition: Cli.FileCommand<A, typeof environmentOptions | undefined, O, R>,
  policy: Pick<Definition<A, O, R>, "mutates" | "hidden" | "authContext"> = {},
) {
  // File commands and mounted root definitions expose the same runtime context.
  // incur currently declares `version` only on the former.
  return applyCommandPolicy(definition as unknown as Definition<A, O, R>, policy);
}
const nativeError = (error: unknown): Errors.IncurError =>
  error instanceof Errors.IncurError ? error : new Errors.IncurError(structuredError(error));
const structuredError = (error: unknown) => {
  const nativeDetails =
    typeof error === "object" && error !== null
      ? {
          ...("retryable" in error && typeof error.retryable === "boolean"
            ? { retryable: error.retryable }
            : {}),
          ...("hint" in error && typeof error.hint === "string" ? { hint: error.hint } : {}),
        }
      : {};
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : String(error);
  const declared =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;
  const exitCode =
    typeof error === "object" &&
    error !== null &&
    "exitCode" in error &&
    typeof error.exitCode === "number"
      ? error.exitCode
      : 1;
  if (/Unable to connect|Network request .* failed|\bfetch failed\b/i.test(message)) {
    return { code: "NETWORK_ERROR", exitCode, message, retryable: true };
  }
  if (/\bdoes not exist\b|\bnot found\b/i.test(message)) {
    return {
      code: declared ?? "NOT_FOUND",
      exitCode,
      message,
      retryable: false,
      ...nativeDetails,
    };
  }
  return {
    code: declared ?? (exitCode === 2 ? "VALIDATION_ERROR" : "COMMAND_FAILED"),
    exitCode,
    message,
    retryable: false,
    ...nativeDetails,
  };
};

type MutationContext = {
  agent: boolean;
  globals: { readOnly?: boolean; yes?: boolean };
  env?: { PRISM_READ_ONLY?: string };
};
const isReadOnlyContext = (context: MutationContext): boolean =>
  context.globals.readOnly === true ||
  /^(?:1|true)$/i.test(
    context.env?.PRISM_READ_ONLY ?? getRuntimeEnvironment().PRISM_READ_ONLY ?? "",
  );

export const assertMutationAllowed = (context: MutationContext): void => {
  if (isReadOnlyContext(context)) {
    throw new Errors.IncurError({
      message: "Read-only mode prohibits this command.",
      code: "READ_ONLY",
      exitCode: 2,
    });
  }
  if (context.agent && context.globals.yes !== true) {
    throw new Errors.IncurError({
      message: "This command can modify state. Approve with --yes, or context.yes=true in MCP.",
      code: "CONFIRMATION_REQUIRED",
      exitCode: 2,
    });
  }
};

import "./index.js";
import { Cli, type z } from "incur";
import {
  preparedCommand,
  commandMiddleware,
  commandVars,
  environmentOptions,
  globalOptions,
} from "./command.js";

/** Exercise native parsing and middleware; never provide a synthetic handler context. */
export async function runCommand<
  Args extends z.ZodObject | undefined,
  Env extends z.ZodObject | undefined,
  Options extends z.ZodObject | undefined,
  Output extends z.ZodType | undefined,
>(
  command: Cli.create.Options<
    Args,
    Env,
    Options,
    Output,
    typeof commandVars,
    typeof globalOptions
  > & {
    run: NonNullable<
      Cli.create.Options<
        Args,
        Env,
        Options,
        Output,
        typeof commandVars,
        typeof globalOptions
      >["run"]
    >;
  },
  argv: string[],
): Promise<unknown> {
  command = preparedCommand(command);
  let returned: unknown;
  let failure: unknown;
  let exitCode = 0;
  const output: string[] = [];
  const agent = argv.includes("--agent") && !argv.includes("--no-agent");
  const native = Cli.create("test", {
    globals: globalOptions,
    env: environmentOptions,
    vars: commandVars,
  })
    .use(commandMiddleware)
    .command("run", {
      ...command,
      run(context) {
        const observed = {
          ...context,
          ok(data: Parameters<typeof context.ok>[0], meta?: Parameters<typeof context.ok>[1]) {
            returned = data;
            return context.ok(data, meta);
          },
          error(error: Parameters<typeof context.error>[0]) {
            failure = Object.assign(new Error(error.message), error);
            return context.error(error);
          },
        };
        try {
          const result = command.run(observed);
          if (result && typeof result === "object" && Symbol.asyncIterator in result) {
            const chunks: unknown[] = [];
            return (async function* () {
              try {
                const iterator = result[Symbol.asyncIterator]();
                while (true) {
                  const next = await iterator.next();
                  if (next.done) {
                    if (returned === undefined) returned = chunks;
                    return next.value;
                  }
                  chunks.push(next.value);
                  yield next.value;
                }
              } catch (error) {
                failure = error;
                throw error;
              }
            })();
          }
          return Promise.resolve(result).then(
            (value) => {
              if (returned === undefined) returned = value;
              return value;
            },
            (error: unknown) => {
              failure = error;
              throw error;
            },
          );
        } catch (error) {
          failure = error;
          throw error;
        }
      },
    });

  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: !agent });
  try {
    await native.serve(["run", ...argv, ...(agent ? ["--json"] : [])], {
      stdout(value) {
        output.push(value);
        if (!agent) process.stdout.write(value);
      },
      exit(code) {
        exitCode = code;
      },
    });
  } finally {
    if (descriptor) Object.defineProperty(process.stdout, "isTTY", descriptor);
    else Reflect.deleteProperty(process.stdout, "isTTY");
  }
  if (failure) throw failure;
  if (exitCode !== 0) {
    let error: { message?: string; code?: string } = {};
    if (agent) {
      try {
        const parsed = JSON.parse(output.join(""));
        error = parsed.error ?? parsed;
      } catch {
        // Human/builtin validation output remains useful if no JSON was produced.
      }
    }
    throw Object.assign(new Error(error.message ?? output.join("")), error, { exitCode });
  }
  return returned;
}

/** Convert structured test inputs into real argv, then use the native CLI path. */
export function runCommandInput<
  Args extends z.ZodObject | undefined,
  Env extends z.ZodObject | undefined,
  Options extends z.ZodObject | undefined,
  Output extends z.ZodType | undefined,
>(
  command: Cli.create.Options<
    Args,
    Env,
    Options,
    Output,
    typeof commandVars,
    typeof globalOptions
  > & {
    run: NonNullable<
      Cli.create.Options<
        Args,
        Env,
        Options,
        Output,
        typeof commandVars,
        typeof globalOptions
      >["run"]
    >;
  },
  input: {
    agent?: boolean;
    args?: Record<string, unknown>;
    options?: Record<string, unknown>;
    globals?: Record<string, unknown>;
  },
): Promise<unknown> {
  const argv: string[] = [];
  for (const name of Object.keys(command.args?.shape ?? {})) {
    const value = input.args?.[name];
    if (value !== undefined) argv.push(...(Array.isArray(value) ? value : [value]).map(String));
  }
  for (const [name, value] of Object.entries({ ...input.options, ...input.globals })) {
    if (value === undefined) continue;
    const flag = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    if (typeof value === "boolean") argv.push(`--${value ? "" : "no-"}${flag}`);
    else
      for (const item of Array.isArray(value) ? value : [value])
        argv.push(`--${flag}`, String(item));
  }
  argv.push(input.agent ? "--agent" : "--no-agent");
  return runCommand(command, argv);
}

import { Cli, z, middleware } from "incur";
import type { commandVars, environmentOptions, globalOptions } from "./command.js";

// This function is never executed. Unlike *.test.ts, this file is included by
// the project's TypeScript check, so unused @ts-expect-error directives fail CI.
export function assertNativeCommandInference(): void {
  Cli.command({
    args: z.object({ id: z.string() }),
    options: z.object({ limit: z.number().int().default(1), verbose: z.boolean().optional() }),
    output: z.object({ id: z.string(), count: z.number() }),
    run(context) {
      const id: string = context.args.id;
      const limit: number = context.options.limit;
      const verbose: boolean | undefined = context.options.verbose;
      void verbose;
      // @ts-expect-error Positional strings do not become untyped values.
      const invalidId: number = context.args.id;
      // @ts-expect-error Schema defaults infer numbers, not arbitrary strings.
      const invalidLimit: string = context.options.limit;
      // @ts-expect-error Undeclared positional arguments are unavailable.
      context.args.missing;
      // @ts-expect-error Undeclared options are unavailable.
      context.options.missing;
      // @ts-expect-error c.ok requires the declared resource id.
      context.ok({ count: limit });
      // @ts-expect-error c.ok validates property types against the output schema.
      context.ok({ id, count: "wrong" });
      void [invalidId, invalidLimit];
      return { id, count: limit };
    },
  });

  middleware<typeof commandVars, typeof environmentOptions, typeof globalOptions>((context) => {
    const profile: string | undefined = context.globals.profile;
    // @ts-expect-error Shared middleware globals retain their declared types.
    const invalidProfile: number = context.globals.profile;
    void [profile, invalidProfile];
  });

  Cli.command({
    output: z.object({ id: z.string() }),
    // @ts-expect-error The native handler must return the declared output shape.
    run: () => ({ count: 1 }),
  });

  Cli.command({
    output: z.object({ id: z.string() }),
    // @ts-expect-error Output property types cannot be widened by handler inference.
    run: () => ({ id: 123 }),
  });
}

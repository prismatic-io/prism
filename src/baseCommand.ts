import { Command, Flags, type Interfaces } from "@oclif/core";
import type { z } from "zod";
import { selectProfile } from "./config.js";
import { useDefaultAuthContext, useProfileAuthContext } from "./context.js";
import { validateFlags } from "./utils/validation.js";

export abstract class PrismaticBaseCommand extends Command {
  static baseFlags = {
    "print-requests": Flags.boolean({
      description: "Print all GraphQL requests that are issued",
      helpGroup: "GLOBAL",
      parse: async (input) => {
        process.env.PRISMATIC_PRINT_REQUESTS = `${input}`;
        return input;
      },
    }),
    quiet: Flags.boolean({
      description: "Reduce helpful notes and text",
      helpGroup: "GLOBAL",
      required: false,
      default: false,
      parse: async (input) => {
        process.env.PRISM_QUIET = `${input}`;
        return input;
      },
    }),
    profile: Flags.string({
      description: "Use a profile",
      env: "PRISM_PROFILE",
      helpGroup: "GLOBAL",
    }),
  };

  protected authContext: "default" | "profile" = "default";
  protected profileName?: string;

  protected async parse<
    CommandFlags extends Record<string, unknown>,
    BaseFlags extends Record<string, unknown>,
    CommandArgs extends Record<string, unknown>,
  >(
    options?: Interfaces.Input<CommandFlags, BaseFlags, CommandArgs>,
    argv?: string[],
  ): Promise<Interfaces.ParserOutput<CommandFlags, BaseFlags, CommandArgs>> {
    const result = await super.parse(options, argv);
    this.profileName = result.flags.profile as string | undefined;
    selectProfile(this.profileName);
    if (this.authContext === "profile") {
      useProfileAuthContext();
    } else {
      useDefaultAuthContext();
    }
    return result;
  }

  static examples: Array<{ description: string; command: string }>;

  protected quietLog(message: string, quiet = false, type?: "warn"): void {
    if (!quiet) {
      if (type === "warn") {
        this.warn(message);
      } else {
        this.log(message);
      }
    }
  }

  protected async parseWithSchema<T extends z.ZodType>(
    schema: T,
  ): Promise<{ args: Record<string, unknown>; flags: z.infer<T> }> {
    const commandClass = this.constructor as typeof Command;
    const { args, flags } = await this.parse(commandClass);
    const validatedFlags = validateFlags(schema, flags);
    return { args, flags: validatedFlags };
  }
}

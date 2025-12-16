import { Command, Flags } from "@oclif/core";
import { z } from "zod";
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
  };

  protected quietLog(message: string, quiet = false, type?: "warn"): void {
    if (!quiet) {
      if (type === "warn") {
        this.warn(message);
      } else {
        this.log(message);
      }
    }
  }

  /**
   * Parse command arguments and validate flags against a Zod schema.
   * Returns parsed args and validated, typed flags.
   */
  protected async parseWithSchema<T extends z.ZodType>(
    schema: T,
  ): Promise<{ args: Record<string, unknown>; flags: z.infer<T> }> {
    const commandClass = this.constructor as typeof Command;
    const { args, flags } = await this.parse(commandClass);
    const validatedFlags = validateFlags(schema, flags);
    return { args, flags: validatedFlags };
  }
}

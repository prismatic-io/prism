import { Command, Flags } from "@oclif/core";

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

  // Ensure consistency across commands and allow for easier parsing in documentation generation
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
}

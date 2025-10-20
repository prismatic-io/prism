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
    "test-api-key": Flags.string({
      description:
        'Provide test API keys for flows in the format provider="API_KEY". Can be specified multiple times.',
      helpGroup: "GLOBAL",
      multiple: true,
      required: false,
    }),
  };
}

import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";
import { exists, readStdin } from "../../fs.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";

export default class ValidateYamlCommand extends PrismaticBaseCommand {
  static description = "Validate a YAML integration definition without importing it";

  static examples = [
    "# Validate a YAML file",
    "<%= config.bin %> <%= command.id %> path/to/integration.yml",
    "",
    "# Validate from stdin",
    "cat integration.yml | <%= config.bin %> <%= command.id %>",
  ];

  static args = {
    path: Args.string({
      description: "Path to YAML file (omit to read from stdin)",
      required: false,
    }),
  };

  async run() {
    const { args } = await this.parse(ValidateYamlCommand);

    let definition: string;

    // Read YAML from file path or stdin
    if (args.path) {
      if (!(await exists(args.path))) {
        this.error(`Cannot find definition file at specified path "${args.path}"`, {
          exit: 2,
        });
      }
      definition = await extractYAMLFromPath(args.path);
    } else {
      if (process.stdin.isTTY) {
        this.error("No file provided. Please provide a path or pipe via stdin.", {
          exit: 2,
        });
      }
      definition = await readStdin();
    }

    if (!definition.trim()) {
      this.error("YAML definition is empty", { exit: 2 });
    }

    // Call the validateIntegrationSchema mutation
    try {
      const result = await gqlRequest({
        document: gql`
          mutation validateIntegrationSchema($definition: String!) {
            validateIntegrationSchema(input: { definition: $definition }) {
              valid
              errors {
                field
                messages
              }
            }
          }
        `,
        variables: {
          definition,
        },
      });

      // If validation passes
      if (result.validateIntegrationSchema.valid) {
        this.log("Integration YAML is valid");
      } else {
        // If the mutation returns valid: false but no errors were thrown
        this.error("Validation failed", { exit: 1 });
      }
    } catch (error) {
      // gqlRequest automatically formats GraphQL errors
      this.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`, {
        exit: 1,
      });
    }
  }
}

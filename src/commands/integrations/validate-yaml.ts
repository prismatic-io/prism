import { Args } from "@oclif/core";
import chalk from "chalk";
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
    "cat integration.yml | <%= config.bin %> <%= command.id %> -",
    "",
    "# Validate from stdin (alternative)",
    "<%= config.bin %> <%= command.id %> - < integration.yml",
  ];

  static args = {
    path: Args.string({
      description: "Path to YAML file (use '-' for stdin)",
      required: true,
    }),
  };

  async run() {
    const { args } = await this.parse(ValidateYamlCommand);

    let definition: string;

    // Read YAML from file path or stdin
    if (args.path === "-") {
      // Explicit stdin indicator
      definition = await readStdin();
    } else {
      // File path provided
      if (!(await exists(args.path))) {
        this.error(`Cannot find definition file at specified path "${args.path}"`, {
          exit: 2,
        });
      }
      definition = await extractYAMLFromPath(args.path);
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
              result {
                isValid
              }
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
      if (result.validateIntegrationSchema?.result?.isValid) {
        this.log(`${chalk.green("✓ ")}Integration YAML is valid`);
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

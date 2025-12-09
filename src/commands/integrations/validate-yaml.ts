import { Args } from "@oclif/core";
import chalk from "chalk";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";
import { exists, readStdin } from "../../fs.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";

export default class ValidateYamlCommand extends PrismaticBaseCommand {
  static description = "Validate a YAML integration definition without importing it";

  static examples = [
    {
      description: "Validate a YAML file",
      command: "<%= config.bin %> <%= command.id %> path/to/integration.yml",
    },
    {
      description: "Validate from stdin",
      command: "cat integration.yml | <%= config.bin %> <%= command.id %> -",
    },
    {
      description: "Validate from stdin (alternative)",
      command: "<%= config.bin %> <%= command.id %> - < integration.yml",
    },
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

    if (args.path === "-") {
      definition = await readStdin();
    } else {
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

      if (result.validateIntegrationSchema?.result?.isValid) {
        this.log(`${chalk.green("✓ ")}Integration YAML is valid`);
      } else {
        this.error("Validation failed", { exit: 1 });
      }
    } catch (error) {
      this.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`, {
        exit: 1,
      });
    }
  }
}

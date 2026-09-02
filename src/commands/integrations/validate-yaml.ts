import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  type CommandContext,
} from "../../command.js";
import chalk from "chalk";
import { exists, readStdin } from "../../fs.js";
import { gql, gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";

export default defineCommand({
  description: "Validate a YAML integration definition without importing it",
  examples: [
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
  ],
  args: {
    path: arg.string({
      description: "Path to YAML file (use '-' for stdin)",
      required: true,
    }),
  },
  async run(_context: CommandContext) {
    const { args } = commandInput();

    let definition: string;

    if (args.path === "-") {
      definition = await readStdin();
    } else {
      if (!(await exists(args.path))) {
        commandOutput.error(`Cannot find definition file at specified path "${args.path}"`, {
          exit: 2,
        });
      }
      definition = await extractYAMLFromPath(args.path);
    }

    if (!definition.trim()) {
      commandOutput.error("YAML definition is empty", { exit: 2 });
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
        commandOutput.log(`${chalk.green("✓ ")}Integration YAML is valid`);
      } else {
        commandOutput.error("Validation failed", { exit: 1 });
      }
    } catch (error) {
      commandOutput.error(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          exit: 1,
        },
      );
    }
  },
});

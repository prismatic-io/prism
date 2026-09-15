import { ValidateIntegrationSchemaDocument as VALIDATE_INTEGRATION_SCHEMA } from "../../graphql/operations/validateIntegrationSchema.generated.js";
import { writeCommandStatus } from "../../command.js";
import chalk from "chalk";
import { exists, readStdin } from "../../fs.js";
import { gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { z, Cli } from "incur";
import { CommandFailedError, ValidationError } from "../../errors.js";

export default Cli.command({
  output: z.object({ valid: z.literal(true), path: z.string() }),
  description: "Validate a YAML integration definition without importing it",
  examples: [
    { description: "Validate a YAML file", args: { path: "path/to/integration.yml" } },
    {
      description: "Validate from stdin (pipe integration.yml into this command)",
      args: { path: "-" },
    },
  ],
  args: z.object({
    path: z.string().describe("Path to YAML file (use '-' for stdin)"),
  }),
  async run(context) {
    const { args } = context;

    let definition: string;

    if (args.path === "-") {
      definition = await readStdin();
    } else {
      if (!(await exists(args.path))) {
        throw new ValidationError({
          message: `Cannot find definition file at specified path "${args.path}"`,
        });
      }
      definition = await extractYAMLFromPath(args.path);
    }

    if (!definition.trim()) {
      throw new ValidationError({
        message: "YAML definition is empty",
      });
    }

    try {
      const result = await gqlRequest({
        document: VALIDATE_INTEGRATION_SCHEMA,
        variables: {
          definition,
        },
      });

      if (result.validateIntegrationSchema?.result?.isValid) {
        writeCommandStatus(`${chalk.green("✓ ")}Integration YAML is valid`);
        return { valid: true as const, path: args.path };
      } else {
        throw new CommandFailedError({
          message: "Validation failed",
        });
      }
    } catch (error) {
      throw new CommandFailedError({
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
});

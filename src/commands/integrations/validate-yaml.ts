import { ValidateIntegrationSchemaDocument as VALIDATE_INTEGRATION_SCHEMA } from "../../graphql/operations/validateIntegrationSchema.generated.js";
import { writeCommandStatus } from "../../command.js";
import chalk from "chalk";
import { exists, readStdin } from "../../fs.js";
import { gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ valid: z.literal(true), path: z.string() }),
  description: "Validate a YAML integration definition without importing it",
  examples: [
    { description: "Validate a YAML file", args: { path: "path/to/integration.yml" } },
    { description: "Validate from stdin", args: { path: "cat" } },
    { description: "Validate from stdin (alternative)", args: { path: "<" } },
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
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          message: `Cannot find definition file at specified path "${args.path}"`,
          exitCode: 2,
        });
      }
      definition = await extractYAMLFromPath(args.path);
    }

    if (!definition.trim()) {
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "YAML definition is empty",
        exitCode: 2,
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
        throw new Errors.IncurError({
          code: "COMMAND_FAILED",
          message: "Validation failed",
          exitCode: 1,
        });
      }
    } catch (error) {
      throw new Errors.IncurError({
        code: "COMMAND_FAILED",
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1,
      });
    }
  },
});

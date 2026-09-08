import { ValidateIntegrationSchemaDocument as VALIDATE_INTEGRATION_SCHEMA } from "../../graphql/operations/validateIntegrationSchema.generated.js";
import { commandOutput, defineCommand, argsSchema } from "../../command.js";
import chalk from "chalk";
import { exists, readStdin } from "../../fs.js";
import { gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  output: z.object({ valid: z.literal(true), path: z.string() }),
  description: "Validate a YAML integration definition without importing it",
  examples: [
    { description: "Validate a YAML file", args: { path: "path/to/integration.yml" } },
    { description: "Validate from stdin", args: { path: "cat" } },
    { description: "Validate from stdin (alternative)", args: { path: "<" } },
  ],
  args: argsSchema(
    z.object({
      path: z.string().describe("Path to YAML file (use '-' for stdin)"),
    }),
  ),
  async run(context) {
    const { args } = context;

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
      const result: ResultOf<typeof VALIDATE_INTEGRATION_SCHEMA> = await gqlRequest({
        document: VALIDATE_INTEGRATION_SCHEMA,
        variables: {
          definition,
        },
      });

      if (result.validateIntegrationSchema?.result?.isValid) {
        commandOutput.log(`${chalk.green("✓ ")}Integration YAML is valid`);
        return { valid: true as const, path: args.path };
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

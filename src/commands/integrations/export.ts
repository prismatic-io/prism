import { defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import {
  exportDefinition,
  INTEGRATION_DEFINITION_VERSION,
} from "../../utils/integration/export.js";
import { dumpYaml } from "../../utils/serialize.js";
import { z } from "incur";

export default defineCommand({
  output: resourceOutputSchema("definition"),
  description: "Export an integration to YAML definition",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an integration to export"),
    }),
  ),
  options: optionsSchema(
    z.object({
      "latest-components": z
        .boolean()
        .optional()
        .describe("Use the latest available version of each Component upon import")
        .meta({ cli: { char: "l" } }),
      version: z.coerce
        .number()
        .int()
        .optional()
        .describe("Define the definition version to export.")
        .meta({ cli: { char: "v" } }),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: { "latest-components": useLatestComponentVersions, version },
    } = context;

    const definition = await exportDefinition({
      integrationId: integration,
      latestComponents: useLatestComponentVersions,
      definitionVersion: version ?? INTEGRATION_DEFINITION_VERSION,
    });
    return resourceOutput(context, "definition", dumpYaml(definition));
  },
});

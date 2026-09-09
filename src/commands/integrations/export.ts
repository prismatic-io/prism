import { warningsOutput } from "../../output.js";
import {
  exportDefinition,
  INTEGRATION_DEFINITION_VERSION,
} from "../../utils/integration/export.js";
import { dumpYaml } from "../../utils/serialize.js";
import { z, Cli } from "incur";

export default Cli.command({
  output: z.object({ definition: z.string() }).extend(warningsOutput),
  description: "Export an integration to YAML definition",
  args: z.object({
    integration: z.string().describe("ID of an integration to export"),
  }),
  options: z.object({
    "latest-components": z
      .boolean()
      .optional()
      .describe("Use the latest available version of each Component upon import"),
    version: z.coerce
      .number()
      .int()
      .optional()
      .describe("Define the definition version to export."),
  }),
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
    return { definition: dumpYaml(definition) };
  },
  alias: { version: "v", "latest-components": "l" },
});

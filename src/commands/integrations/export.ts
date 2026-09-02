import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import {
  exportDefinition,
  INTEGRATION_DEFINITION_VERSION,
} from "../../utils/integration/export.js";
import { dumpYaml } from "../../utils/serialize.js";

export default defineCommand({
  description: "Export an integration to YAML definition",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of an integration to export",
    }),
  },
  options: {
    "latest-components": option.boolean({
      char: "l",
      description: "Use the latest available version of each Component upon import",
    }),
    version: option.integer({
      char: "v",
      description: "Define the definition version to export.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { "latest-components": useLatestComponentVersions, version },
    } = commandInput();

    const definition = await exportDefinition({
      integrationId: integration,
      latestComponents: useLatestComponentVersions,
      definitionVersion: version ?? INTEGRATION_DEFINITION_VERSION,
    });
    commandOutput.log(dumpYaml(definition));
  },
});

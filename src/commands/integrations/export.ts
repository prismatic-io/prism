import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import {
  exportDefinition,
  INTEGRATION_DEFINITION_VERSION,
} from "../../utils/integration/export.js";
import { dumpYaml } from "../../utils/serialize.js";

export default class ExportCommand extends PrismaticBaseCommand {
  static description = "Export an integration to YAML definition";

  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration to export",
    }),
  };
  static flags = {
    "latest-components": Flags.boolean({
      char: "l",
      description: "Use the latest available version of each Component upon import",
    }),
    version: Flags.integer({
      char: "v",
      description: "Define the definition version to export.",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { "latest-components": useLatestComponentVersions, version },
    } = await this.parse(ExportCommand);

    const definition = await exportDefinition({
      integrationId: integration,
      latestComponents: useLatestComponentVersions,
      definitionVersion: version ?? INTEGRATION_DEFINITION_VERSION,
    });
    this.log(dumpYaml(definition));
  }
}

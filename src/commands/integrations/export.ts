import { Command, Args, Flags } from "@oclif/core";
import { exportDefinition } from "../../utils/integration/export.js";
import { dumpYaml } from "../../utils/serialize.js";

export default class ExportCommand extends Command {
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
    "sanitize-connection-inputs": Flags.boolean({
      char: "c",
      description: "Replace connection input values with example strings except scopes",
    }),
    "sanitize-input": Flags.string({
      char: "c",
      description: "Replace specified config variable value with example string",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: {
        "latest-components": useLatestComponentVersions,
        "sanitize-connection-inputs": sanitizeConnectionInputs,
        "sanitize-input": sanitizeInput,
      },
    } = await this.parse(ExportCommand);

    const definition = await exportDefinition({
      integrationId: integration,
      latestComponents: useLatestComponentVersions,
      sanitizeConnectionInputs: sanitizeConnectionInputs,
      sanitizeInput: sanitizeInput,
    });
    this.log(dumpYaml(definition));
  }
}

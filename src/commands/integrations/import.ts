import { Command, Flags } from "@oclif/core";
import { exists } from "../../fs.js";
import {
  importYamlIntegration,
  importCodeNativeIntegration,
} from "../../utils/integration/import.js";
import { openIntegration } from "../../utils/integration/open.js";

export default class ImportCommand extends Command {
  static description =
    "Import an Integration using a YAML definition file or a Code Native Integration";
  static flags = {
    path: Flags.string({
      char: "p",
      required: false,
      description:
        "If supplied, the path to the YAML definition of the integration to import. Not applicable for Code Native Integrations.",
    }),
    integrationId: Flags.string({
      char: "i",
      required: false,
      description: "The ID of the integration being imported",
    }),
    "icon-path": Flags.string({
      required: false,
      description:
        "If supplied, the path to the PNG icon for the integration. Not applicable for Code Native Integrations.",
    }),
    open: Flags.boolean({
      char: "o",
      required: false,
      default: false,
      description: "If supplied, open the Designer for the imported integration",
    }),
  };

  async run() {
    const {
      flags: { path, integrationId, "icon-path": iconPath, open },
    } = await this.parse(ImportCommand);

    if (path && !(await exists(path))) {
      this.error(`Cannot find definition file at specified path "${path}"`, {
        exit: 2,
      });
    }
    if (iconPath && !(await exists(iconPath))) {
      this.error(`Cannot find icon file at specified path "${iconPath}"`, {
        exit: 2,
      });
    }

    const integrationImportId = path
      ? // A path was specified, so assume we're importing a YAML Integration.
        await importYamlIntegration(path, integrationId, iconPath)
      : // No path was specified, so assume the current directory is a Code Native Integration and import it.
        await importCodeNativeIntegration(integrationId);

    this.log(integrationImportId);

    if (open) {
      await openIntegration(integrationImportId);
    }
  }
}

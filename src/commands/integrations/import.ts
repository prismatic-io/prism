import { Command, Flags } from "@oclif/core";
import { fs, exists } from "../../fs";
import { importDefinition } from "../../utils/integration/import";

export default class ImportCommand extends Command {
  static description = "Import an Integration using a YAML definition file";
  static flags = {
    path: Flags.string({
      char: "p",
      required: true,
      description: "path to the YAML definition of the integration to import",
    }),
    integrationId: Flags.string({
      char: "i",
      required: false,
      description: "The ID of the integration being imported",
    }),
  };

  async run() {
    const {
      flags: { path, integrationId },
    } = await this.parse(ImportCommand);

    if (!(await exists(path))) {
      this.error("Cannot find definition file at specified path.", { exit: 2 });
    }

    const definition = await fs.readFile(path, "utf-8");
    const { integrationId: integrationImportId } = await importDefinition(
      definition,
      integrationId
    );
    this.log(integrationImportId);
  }
}

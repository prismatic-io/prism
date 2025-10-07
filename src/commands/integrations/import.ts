import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { exists } from "../../fs.js";
import {
  importYamlIntegration,
  importCodeNativeIntegration,
  getIntegrationDefinition,
  extractYAMLFromPath,
  loadCodeNativeIntegrationEntryPoint,
  compareConfigVars,
} from "../../utils/integration/import.js";
import { openIntegration } from "../../utils/integration/open.js";

export default class ImportCommand extends PrismaticBaseCommand {
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
    replace: Flags.boolean({
      char: "r",
      required: false,
      default: false,
      description:
        "If supplied, allows replacing an existing integration regardless of code-native status. Requires integrationId.",
    }),
    "test-api-key": Flags.string({
      description:
        'Provide test API keys for flows in the format flowName="API_KEY". Can be specified multiple times.',
      helpGroup: "GLOBAL",
      multiple: true,
      required: false,
    }),
  };

  async run() {
    const {
      flags: {
        path,
        integrationId,
        "icon-path": iconPath,
        open,
        replace,
        "test-api-key": testApiKey,
      },
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
    if (replace && !integrationId) {
      this.error("An integrationId is required when using the replace flag", {
        exit: 2,
      });
    }

    if (replace && integrationId) {
      const existingYAML = await getIntegrationDefinition(integrationId);
      const nextYAML = path
        ? await extractYAMLFromPath(path)
        : (await loadCodeNativeIntegrationEntryPoint()).integrationDefinition;
      const missingVars = await compareConfigVars(existingYAML, nextYAML);

      if (missingVars.length > 0) {
        this.warn(
          `The integration you are attempting to replace defines required config variables that are not present in the integration you are importing: ${missingVars.join(
            ", ",
          )}`,
        );

        const confirm = await ux.confirm("Continue? (yes/no)");
        if (!confirm) {
          this.error("Import canceled", { exit: 1 });
        }
      }
    }

    if (replace) {
      this.warn(`You are attempting to replace an existing integration with ${
        path ? `the YAML defined at ${path}` : "the current integration you are building"
      }. By proceeding, the draft version of the existing integration will be replaced by this new version.

There will be no way to restore the existing draft. If you wish to save it, either publish it or export its YAML before proceeding.`);

      const confirm = await ux.confirm("Continue? (yes/no)");
      if (!confirm) {
        this.error("Import canceled", { exit: 1 });
      }
    }

    const integrationImportId = path
      ? // A path was specified, so assume we're importing a YAML Integration.
        await importYamlIntegration(path, integrationId, iconPath, replace)
      : // No path was specified, so assume the current directory is a Code Native Integration and import it.
        await importCodeNativeIntegration(integrationId, replace, testApiKey);

    this.log(integrationImportId);

    if (open) {
      await openIntegration(integrationImportId);
    }
  }
}

import { Command, Flags } from "@oclif/core";
import { exists } from "../../fs";
import { gql, gqlRequest } from "../../graphql";
import { uploadAvatar } from "../../utils/avatar";
import {
  importYamlIntegration,
  importCodeNativeIntegration,
} from "../../utils/integration/import";

export default class ImportCommand extends Command {
  static description =
    "Import an Integration using a YAML definition file or a Code Native Integration";
  static flags = {
    path: Flags.string({
      char: "p",
      required: false,
      description:
        "If supplied, the path to the YAML definition of the integration to import",
    }),
    integrationId: Flags.string({
      char: "i",
      required: false,
      description: "The ID of the integration being imported",
    }),
    "icon-path": Flags.string({
      required: false,
      description: "If supplied, the path to the PNG icon for the integration",
    }),
  };

  async run() {
    const {
      flags: { path, integrationId, "icon-path": iconPath },
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
        await importYamlIntegration(path, integrationId)
      : // No path was specified, so assume the current directory is a Code Native Integration and import it.
        await importCodeNativeIntegration(integrationId);

    if (iconPath) {
      try {
        const avatarUrl = await uploadAvatar(integrationImportId, iconPath);
        await gqlRequest({
          document: gql`
            mutation commitAvatarUpload(
              $integrationId: ID!
              $avatarUrl: String!
            ) {
              updateIntegration(
                input: { id: $integrationId, avatarUrl: $avatarUrl }
              ) {
                integration {
                  id
                }
                errors {
                  field
                  messages
                }
              }
            }
          `,
          variables: {
            integrationId: integrationImportId,
            avatarUrl,
          },
        });
      } catch (err) {
        console.warn(`Error setting integration icon: ${err}`);
      }
    }
    this.log(integrationImportId);
  }
}

import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { CommitAvatarUploadDocument as COMMIT_AVATAR_UPLOAD } from "../../graphql/operations/commitAvatarUpload.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class UpdateAvatarUrlCommand extends PrismaticBaseCommand {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update your Organization Avatar URL";

  static flags = {
    organizationId: Flags.string({
      name: "organization",
      required: true,
      description: "ID of an organization",
    }),
    avatarUrl: Flags.string({
      char: "n",
      required: false,
      description: "Url of the organization avatar",
    }),
  };

  async run() {
    const {
      flags: { organizationId, avatarUrl },
    } = await this.parse(UpdateAvatarUrlCommand);

    if (avatarUrl == null) {
      this.error("--avatarUrl is required to update the avatar");
    }

    const result = await gqlRequest({
      document: COMMIT_AVATAR_UPLOAD,
      variables: {
        organizationId,
        avatarUrl,
      },
    });

    const updatedOrganizationId = result.updateOrganization?.organization?.id;
    if (updatedOrganizationId == null) {
      this.error("The operation returned no resource");
    }

    this.log(updatedOrganizationId);
  }
}

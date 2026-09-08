import { DeleteOrganizationSigningKeyMutationDocument as DELETE_ORGANIZATION_SIGNING_KEY_MUTATION } from "../../../graphql/operations/DeleteOrganizationSigningKeyMutation.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an embedded marketplace signing key";
  static args = {
    signingKeyId: Args.string({
      required: true,
      description: "ID of the signing key to delete",
    }),
  };

  async run() {
    const {
      args: { signingKeyId },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_ORGANIZATION_SIGNING_KEY_MUTATION,
      variables: {
        id: signingKeyId,
      },
    });
  }
}

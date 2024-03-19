import { Command, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends Command {
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
      document: gql`
        mutation ($id: ID!) {
          deleteOrganizationSigningKey(input: { id: $id }) {
            organizationSigningKey {
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
        id: signingKeyId,
      },
    });
  }
}

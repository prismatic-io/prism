import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Organization Credential";
  static args = {
    credential: Args.string({
      required: true,
      description: "ID of the credential to delete",
    }),
  };

  async run() {
    const {
      args: { credential },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteCredential($id: ID!) {
          deleteCredential(input: { id: $id }) {
            credential {
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
        id: credential,
      },
    });
  }
}

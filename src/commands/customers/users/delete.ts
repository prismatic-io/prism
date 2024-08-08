import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete a Customer User";
  static args = {
    user: Args.string({
      required: true,
      description: "ID of the user to delete",
    }),
  };

  async run() {
    const {
      args: { user },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteUser($id: ID!) {
          deleteUser(input: { id: $id }) {
            user {
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
        id: user,
      },
    });
  }
}

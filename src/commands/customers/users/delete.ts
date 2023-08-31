import { Command, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class DeleteCommand extends Command {
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

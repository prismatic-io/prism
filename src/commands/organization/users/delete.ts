import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Delete an Organization User",
  args: {
    user: arg.string({
      required: true,
      description: "ID of the user to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { user },
    } = commandInput();

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
  },
});

import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Delete an Alert Group",
  args: {
    group: arg.string({
      required: true,
      description: "ID of the group to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { group },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteAlertGroup($id: ID!) {
          deleteAlertGroup(input: { id: $id }) {
            alertGroup {
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
        id: group,
      },
    });
  },
});

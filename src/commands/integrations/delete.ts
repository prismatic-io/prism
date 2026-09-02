import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Delete an Integration",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of the integration to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteIntegration($id: ID!) {
          deleteIntegration(input: { id: $id }) {
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
        id: integration,
      },
    });
  },
});

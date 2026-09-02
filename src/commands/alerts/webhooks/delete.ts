import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Delete an Alert Webhook",
  args: {
    webhook: arg.string({
      required: true,
      description: "ID of the webhook to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { webhook },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteAlertWebhook($id: ID!) {
          deleteAlertWebhook(input: { id: $id }) {
            alertWebhook {
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
        id: webhook,
      },
    });
  },
});

import { Command } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class DeleteCommand extends Command {
  static description = "Delete an Alert Webhook";
  static args = [
    {
      name: "webhook",
      required: true,
      description: "ID of the webhook to delete",
    },
  ];

  async run() {
    const {
      args: { webhook },
    } = await this.parse(DeleteCommand);

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
  }
}

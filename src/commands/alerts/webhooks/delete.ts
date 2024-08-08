import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, gql } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Alert Webhook";
  static args = {
    webhook: Args.string({
      required: true,
      description: "ID of the webhook to delete",
    }),
  };

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

import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { DeleteAlertWebhookDocument as DELETE_ALERT_WEBHOOK } from "../../../graphql/operations/deleteAlertWebhook.generated.js";
import { gqlRequest } from "../../../graphql.js";

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
      document: DELETE_ALERT_WEBHOOK,
      variables: {
        id: webhook,
      },
    });
  }
}

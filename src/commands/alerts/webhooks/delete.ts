import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { DeleteAlertWebhookDocument as DELETE_ALERT_WEBHOOK } from "../../../graphql/operations/deleteAlertWebhook.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertWebhookId").extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Webhook",
  args: argsSchema(
    z.object({
      webhook: z.string().describe("ID of the webhook to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { webhook },
    } = context;

    await gqlRequest({
      document: DELETE_ALERT_WEBHOOK,
      variables: {
        id: webhook,
      },
    });
    return resultOutput(context, { alertWebhookId: webhook, deleted: true });
  },
});

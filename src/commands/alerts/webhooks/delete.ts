import { z, Cli } from "incur";
import { DeleteAlertWebhookDocument as DELETE_ALERT_WEBHOOK } from "../../../graphql/operations/deleteAlertWebhook.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ alertWebhookId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Webhook",
  args: z.object({
    webhook: z.string().describe("ID of the webhook to delete"),
  }),
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
    return { alertWebhookId: webhook, deleted: true as const };
  },
});

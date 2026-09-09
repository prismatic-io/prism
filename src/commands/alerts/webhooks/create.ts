import { CreateAlertWebhookDocument as CREATE_ALERT_WEBHOOK } from "../../../graphql/operations/createAlertWebhook.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ alertWebhookId: z.string() }).extend(warningsOutput),
  description: "Create an Alert Webhook",
  options: z.object({
    name: z.string().describe("name of the webhook to be created"),
    url: z.string().describe("URL that will receive a POST request for an alert"),
    headers: z
      .string()
      .optional()
      .describe("JSON-formatted object of key/value pairs to include in the request header"),
    payloadTemplate: z
      .string()
      .describe(
        "template string that will be used as the request body, see documentation for details",
      ),
  }),
  async run(context) {
    const {
      options: { name, url, headers, payloadTemplate },
    } = context;

    const result = await gqlRequest({
      document: CREATE_ALERT_WEBHOOK,
      variables: {
        name,
        url,
        headers,
        payloadTemplate,
      },
    });
    const requiredValue1 = result.createAlertWebhook?.alertWebhook?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Alert webhook was not created",
        exitCode: 2,
      });

    return {
      alertWebhookId: requiredValue1,
    };
  },
  alias: { payloadTemplate: "p", headers: "h", url: "u", name: "n" },
});

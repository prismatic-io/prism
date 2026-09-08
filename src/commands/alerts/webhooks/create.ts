import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { CreateAlertWebhookDocument as CREATE_ALERT_WEBHOOK } from "../../../graphql/operations/createAlertWebhook.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertWebhookId"),
  description: "Create an Alert Webhook",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("name of the webhook to be created")
        .meta({ cli: { char: "n" } }),
      url: z
        .string()
        .describe("URL that will receive a POST request for an alert")
        .meta({ cli: { char: "u" } }),
      headers: z
        .string()
        .optional()
        .describe("JSON-formatted object of key/value pairs to include in the request header")
        .meta({ cli: { char: "h" } }),
      payloadTemplate: z
        .string()
        .describe(
          "template string that will be used as the request body, see documentation for details",
        )
        .meta({ cli: { char: "p" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, url, headers, payloadTemplate },
    } = context;

    const result: ResultOf<typeof CREATE_ALERT_WEBHOOK> = await gqlRequest({
      document: CREATE_ALERT_WEBHOOK,
      variables: {
        name,
        url,
        headers,
        payloadTemplate,
      },
    });

    return resourceOutput(
      context,
      "alertWebhookId",
      result.createAlertWebhook?.alertWebhook?.id ??
        commandOutput.error("Alert webhook was not created"),
    );
  },
});

import type { ResultOf } from "@graphql-typed-document-node/core";
import { CreateAlertWebhookDocument as CREATE_ALERT_WEBHOOK } from "../../../graphql/operations/createAlertWebhook.generated.js";
import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create an Alert Webhook";
  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the webhook to be created",
    }),
    url: Flags.string({
      char: "u",
      required: true,
      description: "URL that will receive a POST request for an alert",
    }),
    headers: Flags.string({
      required: false,
      char: "h",
      description: "JSON-formatted object of key/value pairs to include in the request header",
    }),
    payloadTemplate: Flags.string({
      char: "p",
      required: true,
      description:
        "template string that will be used as the request body, see documentation for details",
    }),
  };

  async run() {
    const {
      flags: { name, url, headers, payloadTemplate },
    } = await this.parse(CreateCommand);

    const result: ResultOf<typeof CREATE_ALERT_WEBHOOK> = await gqlRequest({
      document: CREATE_ALERT_WEBHOOK,
      variables: {
        name,
        url,
        headers,
        payloadTemplate,
      },
    });

    this.log(
      result.createAlertWebhook?.alertWebhook?.id ?? this.error("Alert webhook was not created"),
    );
  }
}

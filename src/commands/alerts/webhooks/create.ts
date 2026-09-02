import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Create an Alert Webhook",
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "name of the webhook to be created",
    }),
    url: option.string({
      char: "u",
      required: true,
      description: "URL that will receive a POST request for an alert",
    }),
    headers: option.string({
      required: false,
      char: "h",
      description: "JSON-formatted object of key/value pairs to include in the request header",
    }),
    payloadTemplate: option.string({
      char: "p",
      required: true,
      description:
        "template string that will be used as the request body, see documentation for details",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, url, headers, payloadTemplate },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation createAlertWebhook(
          $name: String!
          $url: String!
          $headers: String
          $payloadTemplate: String!
        ) {
          createAlertWebhook(
            input: {
              name: $name
              url: $url
              headers: $headers
              payloadTemplate: $payloadTemplate
            }
          ) {
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
        name,
        url,
        headers,
        payloadTemplate,
      },
    });

    commandOutput.log(result.createAlertWebhook.alertWebhook.id);
  },
});

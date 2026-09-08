import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { parseJsonOrUndefined } from "../../../fields.js";
import { CreateAlertGroupDocument as CREATE_ALERT_GROUP } from "../../../graphql/operations/createAlertGroup.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertGroupId"),
  description: "Create an Alert Group",
  examples: [
    {
      description: "Create a group for 'DevOps':",
      options: {
        name: "DevOps",
        users:
          "[\\\"$(prism organization:users:list --columns id --filter 'Name=John Doe' --no-header)\\\"]",
      },
    },
  ],
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("name of the group to be created")
        .meta({ cli: { char: "n" } }),
      users: z
        .string()
        .optional()
        .describe("JSON-formatted list of Prismatic user IDs to alert")
        .meta({ cli: { char: "u" } }),
      webhooks: z
        .string()
        .optional()
        .describe("JSON-formatted list of Alert Webhook IDs to alert")
        .meta({ cli: { char: "w" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, users: userJson, webhooks: webhookJson },
    } = context;

    const users = parseJsonOrUndefined(userJson);
    const webhooks = parseJsonOrUndefined(webhookJson);

    const result: ResultOf<typeof CREATE_ALERT_GROUP> = await gqlRequest({
      document: CREATE_ALERT_GROUP,
      variables: {
        name,
        users,
        webhooks,
      },
    });

    return resourceOutput(
      context,
      "alertGroupId",
      result.createAlertGroup?.alertGroup?.id ?? commandOutput.error("Alert group was not created"),
    );
  },
});

import { parseJsonOrUndefined } from "../../../fields.js";
import { CreateAlertGroupDocument as CREATE_ALERT_GROUP } from "../../../graphql/operations/createAlertGroup.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ alertGroupId: z.string() }).extend(warningsOutput),
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
  options: z.object({
    name: z.string().describe("name of the group to be created"),
    users: z.string().optional().describe("JSON-formatted list of Prismatic user IDs to alert"),
    webhooks: z.string().optional().describe("JSON-formatted list of Alert Webhook IDs to alert"),
  }),
  async run(context) {
    const {
      options: { name, users: userJson, webhooks: webhookJson },
    } = context;

    const users = parseJsonOrUndefined(userJson);
    const webhooks = parseJsonOrUndefined(webhookJson);

    const result = await gqlRequest({
      document: CREATE_ALERT_GROUP,
      variables: {
        name,
        users,
        webhooks,
      },
    });
    const requiredValue1 = result.createAlertGroup?.alertGroup?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Alert group was not created",
        exitCode: 2,
      });

    return {
      alertGroupId: requiredValue1,
    };
  },
  alias: { webhooks: "w", users: "u", name: "n" },
});

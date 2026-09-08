import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { DeleteAlertGroupDocument as DELETE_ALERT_GROUP } from "../../../graphql/operations/deleteAlertGroup.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertGroupId").extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Group",
  args: argsSchema(
    z.object({
      group: z.string().describe("ID of the group to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { group },
    } = context;

    await gqlRequest({
      document: DELETE_ALERT_GROUP,
      variables: {
        id: group,
      },
    });
    return resultOutput(context, { alertGroupId: group, deleted: true });
  },
});

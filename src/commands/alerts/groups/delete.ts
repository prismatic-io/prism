import { z, Cli } from "incur";
import { DeleteAlertGroupDocument as DELETE_ALERT_GROUP } from "../../../graphql/operations/deleteAlertGroup.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ alertGroupId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Group",
  args: z.object({
    group: z.string().describe("ID of the group to delete"),
  }),
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
    return { alertGroupId: group, deleted: true as const };
  },
});

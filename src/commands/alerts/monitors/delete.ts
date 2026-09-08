import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { DeleteAlertMonitorDocument as DELETE_ALERT_MONITOR } from "../../../graphql/operations/deleteAlertMonitor.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertMonitorId").extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Monitor",
  args: argsSchema(
    z.object({
      monitor: z.string().describe("ID of the monitor to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { monitor },
    } = context;

    await gqlRequest({
      document: DELETE_ALERT_MONITOR,
      variables: {
        id: monitor,
      },
    });
    return resultOutput(context, { alertMonitorId: monitor, deleted: true });
  },
});

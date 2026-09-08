import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { ClearAlertMonitorDocument as CLEAR_ALERT_MONITOR } from "../../../graphql/operations/clearAlertMonitor.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("alertMonitorId").extend({ cleared: z.literal(true) }),
  description: "Clear an Alert Monitor",
  args: argsSchema(
    z.object({
      monitor: z.string().describe("ID of the monitor to clear"),
    }),
  ),
  async run(context) {
    const {
      args: { monitor },
    } = context;

    await gqlRequest({
      document: CLEAR_ALERT_MONITOR,
      variables: {
        id: monitor,
      },
    });
    return resultOutput(context, { alertMonitorId: monitor, cleared: true });
  },
});

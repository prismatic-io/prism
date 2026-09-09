import { z, Cli } from "incur";
import { ClearAlertMonitorDocument as CLEAR_ALERT_MONITOR } from "../../../graphql/operations/clearAlertMonitor.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ alertMonitorId: z.string() })
    .extend(warningsOutput)
    .extend({ cleared: z.literal(true) }),
  description: "Clear an Alert Monitor",
  args: z.object({
    monitor: z.string().describe("ID of the monitor to clear"),
  }),
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
    return { alertMonitorId: monitor, cleared: true as const };
  },
});

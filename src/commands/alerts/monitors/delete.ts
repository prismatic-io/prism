import { z, Cli } from "incur";
import { DeleteAlertMonitorDocument as DELETE_ALERT_MONITOR } from "../../../graphql/operations/deleteAlertMonitor.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ alertMonitorId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Alert Monitor",
  args: z.object({
    monitor: z.string().describe("ID of the monitor to delete"),
  }),
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
    return { alertMonitorId: monitor, deleted: true as const };
  },
});

import { tableOutputSchema, tableFlags, printTable } from "../../../utils/table.js";
import { ListAlertEventsDocument as LIST_ALERT_EVENTS } from "../../../graphql/operations/listAlertEvents.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { z, Cli } from "incur";
type AlertEvent = {
  createdAt: unknown;
  details: unknown;
  id: unknown;
  monitor: { name: unknown };
};

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "createdAt", "details"]),
  description: "List Alert Events for an Alert Monitor",
  args: z.object({
    alertMonitorId: z.string().describe("ID of an alert monitor"),
  }),
  options: z.object({
    ...tableFlags(),
  }),
  async run(context) {
    const {
      options: flags,
      args: { alertMonitorId },
    } = context;

    const result = await gqlRequest({
      document: LIST_ALERT_EVENTS,
      variables: {
        alertMonitorId,
      },
    });

    return printTable(
      result.alertEvents.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row: AlertEvent) => row.monitor.name,
          header: "Name",
        },
        createdAt: {
          header: "Timestamp",
        },
        details: {},
      },
      { ...flags },
    );
  },
});

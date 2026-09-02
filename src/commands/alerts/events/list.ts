import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

type AlertEvent = {
  createdAt: unknown;
  details: unknown;
  id: unknown;
  monitor: { name: unknown };
};

type AlertEventsQuery = { alertEvents: { nodes: AlertEvent[] } };

export default defineCommand({
  description: "List Alert Events for an Alert Monitor",
  args: {
    alertMonitorId: arg.string({
      description: "ID of an alert monitor",
      required: true,
    }),
  },
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const {
      flags,
      args: { alertMonitorId },
    } = commandInput();

    const result = await gqlRequest<AlertEventsQuery>({
      document: gql`
        query listAlertEvents($alertMonitorId: ID) {
          alertEvents(
            monitor: $alertMonitorId
            sortBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            nodes {
              id
              monitor {
                name
              }
              createdAt
              details
            }
          }
        }
      `,
      variables: {
        alertMonitorId,
      },
    });

    return ux.table(
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

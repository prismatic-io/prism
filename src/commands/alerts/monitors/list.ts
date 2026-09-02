import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface AlertMonitorNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  triggered: Scalars["Boolean"]["output"];
  instance: {
    id: Scalars["ID"]["output"];
    name: Scalars["String"]["output"];
    customer: { id: Scalars["ID"]["output"]; name: Scalars["String"]["output"] };
  };
}

interface ListAlertMonitorsQuery {
  alertMonitors: {
    nodes: Array<AlertMonitorNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isAlertMonitorNode = (node: AlertMonitorNode | null): node is AlertMonitorNode =>
  node !== null;

export default defineCommand({
  description: "List Alert Monitors for Customer Instances",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    let alertMonitors: AlertMonitorNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertMonitors: { nodes, pageInfo },
      }: ListAlertMonitorsQuery = await gqlRequest<ListAlertMonitorsQuery>({
        document: gql`
          query listAlertMonitors($after: String) {
            alertMonitors(after: $after) {
              nodes {
                id
                name
                triggered
                instance {
                  id
                  name
                  customer {
                    id
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: { after: cursor },
      });
      alertMonitors = [...alertMonitors, ...nodes.filter(isAlertMonitorNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      alertMonitors,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        triggered: {},
        customer: {
          get: ({ instance: { customer } }) => customer.name,
        },
        customerId: {
          extended: true,
          get: ({ instance: { customer } }) => customer.id,
        },
        instance: { get: ({ instance }) => instance.name },
        instanceId: { extended: true, get: ({ instance }) => instance.id },
      },
      { ...flags },
    );
  },
});

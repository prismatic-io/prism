import { defineCommand, optionsSchema } from "../../../command.js";
import type { ListAlertMonitorsQuery } from "../../../graphql/alerts/listAlertMonitors.generated.js";
import { ListAlertMonitorsDocument as LIST_ALERT_MONITORS } from "../../../graphql/alerts/listAlertMonitors.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { z } from "incur";

type AlertMonitorNode = NonNullable<ListAlertMonitorsQuery["alertMonitors"]["nodes"][number]>;

const isAlertMonitorNode = (node: AlertMonitorNode | null): node is AlertMonitorNode =>
  node !== null;

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(
    ["id", "name", "triggered", "customer", "customerId", "instance", "instanceId"],
    true,
  ),
  description: "List Alert Monitors for Customer Instances",
  options: optionsSchema(z.object({ ...ux.table.flags(), ...paginationFlags() })),
  async run(context) {
    const { options: flags } = context;

    let alertMonitors: AlertMonitorNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        alertMonitors: { nodes, pageInfo },
      }: ListAlertMonitorsQuery = await gqlRequest({
        document: LIST_ALERT_MONITORS,
        variables: { after: cursor, first: flags.first },
      });
      alertMonitors = [...alertMonitors, ...nodes.filter(isAlertMonitorNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = ux.table(
      alertMonitors,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        triggered: {},
        customer: {
          get: ({ instance }) => instance?.customer.name ?? "",
        },
        customerId: {
          extended: true,
          get: ({ instance }) => instance?.customer.id ?? "",
        },
        instance: { get: ({ instance }) => instance?.name ?? "" },
        instanceId: { extended: true, get: ({ instance }) => instance?.id ?? "" },
      },
      { ...flags },
    );
    return { ...result, pageInfo: finalPageInfo };
  },
});

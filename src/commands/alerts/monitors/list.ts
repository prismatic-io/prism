import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListAlertMonitorsDocument as LIST_ALERT_MONITORS } from "../../../graphql/alerts/listAlertMonitors.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Monitors for Customer Instances";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertMonitors: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertMonitors: { nodes, pageInfo },
      }: ResultOf<typeof LIST_ALERT_MONITORS> = await gqlRequest({
        document: LIST_ALERT_MONITORS,
        variables: { after: cursor },
      });
      alertMonitors = [...alertMonitors, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
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
  }
}

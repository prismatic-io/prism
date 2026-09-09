import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListAlertWebhooksDocument as LIST_ALERT_WEBHOOKS,
  type ListAlertWebhooksQuery,
} from "../../../graphql/alerts/listAlertWebhooks.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Webhooks";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertWebhooks: AlertWebhookNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertWebhooks: { nodes, pageInfo },
      }: ListAlertWebhooksQuery = await gqlRequest({
        document: LIST_ALERT_WEBHOOKS,
        variables: { after: cursor },
      });
      alertWebhooks = [...alertWebhooks, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      alertWebhooks,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        url: {
          extended: true,
        },
        headers: {
          extended: true,
        },
        payloadTemplate: {
          header: "Payload Template",
          extended: true,
        },
      },
      { ...flags },
    );
  }
}

type AlertWebhookNode = ListAlertWebhooksQuery["alertWebhooks"]["nodes"][number];

import type { ListAlertWebhooksQuery } from "../../../graphql/alerts/listAlertWebhooks.generated.js";
import { ListAlertWebhooksDocument as LIST_ALERT_WEBHOOKS } from "../../../graphql/alerts/listAlertWebhooks.generated.js";
import { gqlRequest } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";

type AlertWebhookNode = ListAlertWebhooksQuery["alertWebhooks"]["nodes"][number];

const isAlertWebhookNode = (node: AlertWebhookNode | null): node is AlertWebhookNode =>
  node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "url", "headers", "payloadTemplate"], true),
  description: "List Alert Webhooks",
  options: z.object({ ...tableFlags(), ...paginationFlags() }),
  async run(context) {
    const { options: flags } = context;

    let alertWebhooks: AlertWebhookNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        alertWebhooks: { nodes, pageInfo },
      }: ListAlertWebhooksQuery = await gqlRequest({
        document: LIST_ALERT_WEBHOOKS,
        variables: { after: cursor, first: flags.first },
      });
      alertWebhooks = [...alertWebhooks, ...nodes.filter(isAlertWebhookNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
    return { ...result, pageInfo: finalPageInfo };
  },
});

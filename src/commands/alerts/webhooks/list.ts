import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface AlertWebhookNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  payloadTemplate?: Scalars["String"]["output"] | null;
  url: Scalars["String"]["output"];
  headers: unknown;
}

interface ListAlertWebhooksQuery {
  alertWebhooks: {
    nodes: Array<AlertWebhookNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isAlertWebhookNode = (node: AlertWebhookNode | null): node is AlertWebhookNode =>
  node !== null;

export default defineCommand({
  description: "List Alert Webhooks",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    let alertWebhooks: AlertWebhookNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertWebhooks: { nodes, pageInfo },
      }: ListAlertWebhooksQuery = await gqlRequest<ListAlertWebhooksQuery>({
        document: gql`
          query listAlertWebhooks($after: String) {
            alertWebhooks(after: $after) {
              nodes {
                id
                name
                payloadTemplate
                url
                headers
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
      alertWebhooks = [...alertWebhooks, ...nodes.filter(isAlertWebhookNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});

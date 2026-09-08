import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListAlertWebhooksDocument as LIST_ALERT_WEBHOOKS } from "../../../graphql/alerts/listAlertWebhooks.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Webhooks";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertWebhooks: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertWebhooks: { nodes, pageInfo },
      }: ResultOf<typeof LIST_ALERT_WEBHOOKS> = await gqlRequest({
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

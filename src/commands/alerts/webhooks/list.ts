import { Command, ux } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql.js";

export default class ListCommand extends Command {
  static description = "List Alert Webhooks";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertWebhooks: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        alertWebhooks: { nodes, pageInfo },
      } = await gqlRequest({
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

import { Command, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Alert Monitors for Customer Instances";
  static flags = { ...CliUx.ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertMonitors: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        alertMonitors: { nodes, pageInfo },
      } = await gqlRequest({
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
      alertMonitors = [...alertMonitors, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    CliUx.ux.table(
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
      { ...flags }
    );
  }
}

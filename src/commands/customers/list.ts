import { Command, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class ListCommand extends Command {
  static description = "List your Customers";
  static flags = { ...CliUx.ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customers: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        customers: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listCustomers($after: String) {
            customers(isSystem: false, after: $after) {
              nodes {
                id
                name
                externalId
                description
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
      customers = [...customers, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    CliUx.ux.table(
      customers,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        externalId: {
          extended: true,
          get: ({ externalId }) => externalId || "",
        },
        name: {},
        description: {},
      },
      { ...flags }
    );
  }
}

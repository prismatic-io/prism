import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List your Customers";
  static flags = { ...ux.table.flags() };

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

    ux.table(
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
      { ...flags },
    );
  }
}

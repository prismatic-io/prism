import { Args, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Customer Users";
  static args = {
    customer: Args.string({
      description: "ID of the customer",
      required: true,
    }),
  };

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { customer },
      flags,
    } = await this.parse(ListCommand);

    let customerUsers: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        customer: {
          users: { nodes, pageInfo },
        },
      } = await gqlRequest({
        document: gql`
          query listCustomerUsers($id: ID!, $after: String) {
            customer(id: $id) {
              users(after: $after) {
                nodes {
                  id
                  name
                  email
                  externalId
                  role {
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `,
        variables: { id: customer, after: cursor },
      });
      customerUsers = [...customerUsers, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      customerUsers,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        email: {},
        role: { get: ({ role: { name } }) => name },
        externalId: {
          extended: true,
          get: ({ externalId }) => externalId || "",
        },
      },
      { ...flags },
    );
  }
}

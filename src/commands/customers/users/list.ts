import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface CustomerUserNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  externalId?: Scalars["String"]["output"] | null;
  role: { name: Scalars["String"]["output"] };
}

interface ListCustomerUsersQuery {
  customer: {
    users: {
      nodes: Array<CustomerUserNode | null>;
      pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
  };
}

const isCustomerUserNode = (node: CustomerUserNode | null): node is CustomerUserNode =>
  node !== null;

export default defineCommand({
  description: "List Customer Users",
  args: {
    customer: arg.string({
      description: "ID of the customer",
      required: true,
    }),
  },
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const {
      args: { customer },
      flags,
    } = commandInput();

    let customerUsers: CustomerUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        customer: {
          users: { nodes, pageInfo },
        },
      }: ListCustomerUsersQuery = await gqlRequest<ListCustomerUsersQuery>({
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
      customerUsers = [...customerUsers, ...nodes.filter(isCustomerUserNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});

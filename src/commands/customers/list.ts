import { commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import type { Scalars } from "../../graphql/schema.generated.js";
import { ux } from "../../utils/ux.js";

interface CustomerNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  externalId?: Scalars["String"]["output"] | null;
  description?: Scalars["String"]["output"] | null;
}

interface ListCustomersQuery {
  customers: {
    nodes: Array<CustomerNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isCustomerNode = (node: CustomerNode | null): node is CustomerNode => node !== null;

export default defineCommand({
  description: "List your Customers",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    let customers: CustomerNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        customers: { nodes, pageInfo },
      }: ListCustomersQuery = await gqlRequest<ListCustomersQuery>({
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
      customers = [...customers, ...nodes.filter(isCustomerNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});

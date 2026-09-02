import { commandInput, defineCommand, option, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import type { Scalars } from "../../graphql/schema.generated.js";
import { ux } from "../../utils/ux.js";

interface InstanceNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  description?: Scalars["String"]["output"] | null;
  enabled: Scalars["Boolean"]["output"];
  customer: {
    id: Scalars["ID"]["output"];
    name: Scalars["String"]["output"];
    externalId?: Scalars["String"]["output"] | null;
  };
}

interface ListInstancesQuery {
  instances: {
    nodes: Array<InstanceNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isInstanceNode = (node: InstanceNode | null): node is InstanceNode => node !== null;

export default defineCommand({
  description: "List Instances",
  options: {
    customer: option.string({
      char: "c",
      required: false,
      description: "ID of a customer",
    }),
    integration: option.string({
      char: "i",
      required: false,
      description: "ID of an integration",
    }),
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();
    const { customer, integration } = flags;

    let instances: InstanceNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        instances: { nodes, pageInfo },
      }: ListInstancesQuery = await gqlRequest<ListInstancesQuery>({
        document: gql`
          query listInstances($customer: ID, $integration: ID, $after: String) {
            instances(
              customer: $customer
              integration: $integration
              isSystem: false
              after: $after
            ) {
              nodes {
                id
                name
                description
                enabled
                customer {
                  id
                  name
                  externalId
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: {
          customer,
          integration,
          after: cursor,
        },
      });
      instances = [...instances, ...nodes.filter(isInstanceNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      instances,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        customer: {
          get: ({ customer }) => customer.name,
        },
        customerid: {
          get: ({ customer }) => customer.id,
          extended: true,
        },
        customerExternalId: {
          get: ({ customer }) => customer.externalId || "",
          extended: true,
        },
        description: {},
        enabled: { extended: true },
      },
      { ...flags },
    );
  },
});

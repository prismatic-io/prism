import { commandInput, defineCommand, option, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import type { OnPremiseResourceStatus, Scalars } from "../../graphql/schema.generated.js";
import { ux } from "../../utils/ux.js";

interface OnPremiseResourceNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  status?: OnPremiseResourceStatus | null;
  customer?: {
    id: Scalars["ID"]["output"];
    name: Scalars["String"]["output"];
    externalId?: Scalars["String"]["output"] | null;
  } | null;
}

interface ListOnPremiseResourcesQuery {
  onPremiseResources: {
    nodes: Array<OnPremiseResourceNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isOnPremiseResourceNode = (
  node: OnPremiseResourceNode | null,
): node is OnPremiseResourceNode => node !== null;

export default defineCommand({
  description: "List On-Premise Resources",
  options: {
    ...ux.table.flags(),
    customer: option.string({
      char: "c",
      description:
        "If specified this command returns only On-Premise Resources that are available to the specified customer ID",
    }),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();
    const { customer } = flags;

    let onPremiseResources: OnPremiseResourceNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        onPremiseResources: { nodes, pageInfo },
      }: ListOnPremiseResourcesQuery = await gqlRequest<ListOnPremiseResourcesQuery>({
        document: gql`
          query listOnPremiseResources($after: String, $customer: ID) {
            onPremiseResources(after: $after, customer: $customer) {
              nodes {
                id
                name
                status
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
          after: cursor,
          customer,
        },
      });
      onPremiseResources = [...onPremiseResources, ...nodes.filter(isOnPremiseResourceNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      onPremiseResources,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        customerId: { header: "Customer ID", extended: true, get: (row) => row.customer?.id ?? "" },
        status: { get: (row) => row.status ?? "" },
        customer: { get: (row) => row.customer?.name ?? "" },
        customerExternalId: {
          header: "Customer External ID",
          extended: true,
          get: (row) => row.customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
  },
});

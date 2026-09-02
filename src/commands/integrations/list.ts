import { commandInput, defineCommand, option, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import type { Scalars } from "../../graphql/schema.generated.js";
import { ux } from "../../utils/ux.js";

interface IntegrationNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  description?: Scalars["String"]["output"] | null;
  versionNumber: Scalars["Int"]["output"];
  labels: unknown;
  category?: Scalars["String"]["output"] | null;
  customer?: {
    id: Scalars["ID"]["output"];
    name: Scalars["String"]["output"];
    externalId?: Scalars["String"]["output"] | null;
  } | null;
}

interface ListIntegrationsQuery {
  integrations: {
    nodes: Array<IntegrationNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isIntegrationNode = (node: IntegrationNode | null): node is IntegrationNode => node !== null;

export default defineCommand({
  description: "List Integrations",
  options: {
    ...ux.table.flags(),
    showAllVersions: option.boolean({
      char: "a",
      description:
        "If specified this command returns all versions of all integrations rather than only the latest version",
    }),
    customer: option.string({
      char: "c",
      description:
        "If specified this command returns only integrations that are available to the specified customer ID",
    }),
    "org-only": option.boolean({
      char: "o",
      description: "If specified this command returns only org integrations",
    }),
    search: option.string({
      char: "s",
      description: "If specified, search for integrations by name (case insensitive).",
    }),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();
    const { showAllVersions, customer, "org-only": orgOnly, search } = flags;

    let integrations: IntegrationNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        integrations: { nodes, pageInfo },
      }: ListIntegrationsQuery = await gqlRequest<ListIntegrationsQuery>({
        document: gql`
          query listIntegrations(
            $showAllVersions: Boolean
            $after: String
            $customer: ID
            $customerIsnull: Boolean
            $search: String
          ) {
            integrations(
              allVersions: $showAllVersions
              after: $after
              customer: $customer
              customer_Isnull: $customerIsnull
              name_Icontains: $search
            ) {
              nodes {
                id
                name
                description
                versionNumber
                labels
                category
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
          showAllVersions,
          after: cursor,
          customer,
          customerIsnull: orgOnly,
          search,
        },
      });
      integrations = [...integrations, ...nodes.filter(isIntegrationNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      integrations,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
        versionNumber: { header: "Version" },
        labels: { extended: true },
        category: { extended: true },
        customerId: { extended: true, get: (row) => row.customer?.id ?? "" },
        customerName: {
          extended: true,
          get: (row) => row.customer?.name ?? "",
        },
        customerExternalId: {
          extended: true,
          get: (row) => row.customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
  },
});

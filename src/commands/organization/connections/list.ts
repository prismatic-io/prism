import { commandInput, defineCommand, option, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

type AvailableConnection = {
  connection: { component: { key: string | null } | null } | null;
  customer: { externalId: string | null; name: string } | null;
  description: string | null;
  managedBy: string;
  stableKey: string;
};

type AvailableConnectionsQuery = { scopedConfigVariables: { nodes: AvailableConnection[] } };

export default defineCommand({
  description: "List all integration-agnostic connections available to the organization",
  options: {
    ...ux.table.flags(),
    "managed-by": option.string({
      description: "Filter connections by management type",
      options: ["org", "customer"],
    }),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    const result = await gqlRequest<AvailableConnectionsQuery>({
      document: gql`
        query availableConnections($managedBy: String) {
          scopedConfigVariables(managedBy: $managedBy) {
            nodes {
              stableKey
              description
              managedBy
              customer {
                externalId
                name
              }
              connection {
                component {
                  key
                }
              }
            }
          }
        }
      `,
      variables: {
        managedBy: flags["managed-by"] || null,
      },
    });

    const connections = result.scopedConfigVariables.nodes;

    return ux.table(
      connections,
      {
        stableKey: {
          header: "Stable Key",
          minWidth: 20,
        },
        description: {
          header: "Description",
          minWidth: 30,
        },
        managedBy: {
          header: "Managed By",
          minWidth: 12,
        },
        customer: {
          header: "Customer",
          get: (row: AvailableConnection) =>
            row.customer ? `${row.customer.name} (${row.customer.externalId})` : "N/A",
          minWidth: 25,
        },
        component: {
          header: "Component",
          get: (row: AvailableConnection) => row.connection?.component?.key || "N/A",
          minWidth: 20,
        },
      },
      { ...flags },
    );
  },
});

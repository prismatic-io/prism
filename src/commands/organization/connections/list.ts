import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List all integration-agnostic connections available to the organization";
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
    "managed-by": Flags.string({
      description: "Filter connections by management type",
      options: ["org", "customer"],
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
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

    if (flags.json) {
      this.logJsonOutput(connections);
    } else {
      ux.table(
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
            get: (row: any) =>
              row.customer ? `${row.customer.name} (${row.customer.externalId})` : "N/A",
            minWidth: 25,
          },
          component: {
            header: "Component",
            get: (row: any) => row.connection?.component?.key || "N/A",
            minWidth: 20,
          },
        },
        { ...flags },
      );
    }
  }
}

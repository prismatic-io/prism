import type { ResultOf } from "@graphql-typed-document-node/core";
import { Flags } from "@oclif/core";
import { AvailableConnectionsDocument as AVAILABLE_CONNECTIONS } from "../../../graphql/operations/availableConnections.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List all integration-agnostic connections available to the organization";
  static flags = {
    ...ux.table.flags(),
    "managed-by": Flags.string({
      description: "Filter connections by management type",
      options: ["org", "customer"],
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof AVAILABLE_CONNECTIONS> = await gqlRequest({
      document: AVAILABLE_CONNECTIONS,
      variables: {
        managedBy: flags["managed-by"] || null,
      },
    });

    const connections = result.scopedConfigVariables.nodes;

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

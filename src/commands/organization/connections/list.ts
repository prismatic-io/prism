import { tableOutputSchema } from "../../../utils/table.js";
import { AvailableConnectionsDocument as AVAILABLE_CONNECTIONS } from "../../../graphql/operations/availableConnections.generated.js";
import { defineCommand, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

type AvailableConnection = {
  connection: { component: { key: string | null } | null } | null;
  customer: { externalId: string | null; name: string } | null;
  description: string | null;
  managedBy: string;
  stableKey: string;
};

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["stableKey", "description", "managedBy", "customer", "component"]),
  description: "List all integration-agnostic connections available to the organization",
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
      "managed-by": z
        .enum(["org", "customer"])
        .optional()
        .describe("Filter connections by management type"),
    }),
  ),
  async run(context) {
    const { options: flags } = context;

    const result: ResultOf<typeof AVAILABLE_CONNECTIONS> = await gqlRequest({
      document: AVAILABLE_CONNECTIONS,
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

import { tableOutputSchema, tableFlags, printTable } from "../../../utils/table.js";
import { ListIntegrationVersionsDocument as LIST_INTEGRATION_VERSIONS } from "../../../graphql/operations/listIntegrationVersions.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { z, Cli } from "incur";
export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema([
    "versionNumber",
    "id",
    "versionCreatedAt",
    "versionCreatedBy",
    "versionComment",
    "available",
  ]),
  description: "List Integration versions",
  options: z.object({
    ...tableFlags(),
    "latest-available": z.boolean().optional().describe("Show only the latest available version"),
  }),
  args: z.object({
    integration: z.string().describe("ID of an integration"),
  }),
  async run(context) {
    const {
      options: flags,
      args: { integration },
    } = context;

    const result = await gqlRequest({
      document: LIST_INTEGRATION_VERSIONS,
      variables: {
        integrationId: integration,
        onlyAvailable: flags["latest-available"] ? true : null,
        onlyShowOne: flags["latest-available"] ? 1 : null,
      },
    });

    return printTable(
      requireResource(result.integration, "Integration").versionSequence.nodes,
      {
        versionNumber: {
          header: "Version",
        },
        id: {
          header: "ID",
          get: (row) => row.id,
          extended: true,
        },
        versionCreatedAt: {
          header: "Created At",
          get: (row) => new Date(row.versionCreatedAt ?? 0).toISOString(),
        },
        versionCreatedBy: {
          header: "Created By",
          get: (row) => row.versionCreatedBy?.email ?? "",
        },
        versionComment: {
          header: "Comment",
          get: (row) => row.versionComment ?? "",
        },
        available: {
          header: "Available",
          get: (row) => row.versionIsAvailable,
        },
      },
      { ...flags },
    );
  },
  alias: { "latest-available": "l" },
});

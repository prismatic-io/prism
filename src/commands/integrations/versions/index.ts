import { tableOutputSchema } from "../../../utils/table.js";
import { ListIntegrationVersionsDocument as LIST_INTEGRATION_VERSIONS } from "../../../graphql/operations/listIntegrationVersions.generated.js";
import { defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
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
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
      "latest-available": z
        .boolean()
        .optional()
        .describe("Show only the latest available version")
        .meta({ cli: { char: "l" } }),
    }),
  ),
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an integration"),
    }),
  ),
  async run(context) {
    const {
      options: flags,
      args: { integration },
    } = context;

    const result: ResultOf<typeof LIST_INTEGRATION_VERSIONS> = await gqlRequest({
      document: LIST_INTEGRATION_VERSIONS,
      variables: {
        integrationId: integration,
        onlyAvailable: flags["latest-available"] ? true : null,
        onlyShowOne: flags["latest-available"] ? 1 : null,
      },
    });

    return ux.table(
      requireResource(result.integration, "Integration").versionSequence.nodes.filter(
        (row): row is NonNullable<typeof row> => row !== null,
      ),
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
});

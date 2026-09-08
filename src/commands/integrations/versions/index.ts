import type { ResultOf } from "@graphql-typed-document-node/core";
import { Args, Flags } from "@oclif/core";
import { ListIntegrationVersionsDocument as LIST_INTEGRATION_VERSIONS } from "../../../graphql/operations/listIntegrationVersions.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Integration versions";

  static flags = {
    ...ux.table.flags(),
    "latest-available": Flags.boolean({
      char: "l",
      description: "Show only the latest available version",
    }),
  };

  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration",
    }),
  };

  async run() {
    const {
      flags,
      args: { integration },
    } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_INTEGRATION_VERSIONS> = await gqlRequest({
      document: LIST_INTEGRATION_VERSIONS,
      variables: {
        integrationId: integration,
        onlyAvailable: flags["latest-available"] ? true : null,
        onlyShowOne: flags["latest-available"] ? 1 : null,
      },
    });

    ux.table(
      requireResource(result.integration, "Integration").versionSequence.nodes,
      {
        versionNumber: {
          header: "Version",
        },
        id: {
          header: "ID",
          get: (row: any) => row.id,
          extended: true,
        },
        versionCreatedAt: {
          header: "Created At",
          get: (row: any) => new Date(row.versionCreatedAt).toISOString(),
        },
        versionCreatedBy: {
          header: "Created By",
          get: (row: any) => row.versionCreatedBy?.email ?? "",
        },
        versionComment: {
          header: "Comment",
          get: (row: any) => row.versionComment ?? "",
        },
        available: {
          header: "Available",
          get: (row: any) => row.versionIsAvailable,
        },
      },
      { ...flags },
    );
  }
}

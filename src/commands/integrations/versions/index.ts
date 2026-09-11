import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { ListIntegrationVersionsDocument as LIST_INTEGRATION_VERSIONS } from "../../../graphql/operations/listIntegrationVersions.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

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

    const result = await gqlRequest({
      document: LIST_INTEGRATION_VERSIONS,
      variables: {
        integrationId: integration,
        onlyAvailable: flags["latest-available"] ? true : null,
        onlyShowOne: flags["latest-available"] ? 1 : null,
      },
    });

    const versions = result.integration?.versionSequence.nodes;
    if (versions == null) {
      this.error("Integration not found");
    }

    ux.table(
      versions,
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
  }
}

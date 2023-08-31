import { Command, ux, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
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
      document: gql`
        query listIntegrationVersions(
          $integrationId: ID!
          $onlyAvailable: Boolean
          $onlyShowOne: Int
        ) {
          integration(id: $integrationId) {
            versionSequence(
              versionIsAvailable: $onlyAvailable
              sortBy: [{ field: VERSION_NUMBER, direction: DESC }]
              first: $onlyShowOne
            ) {
              nodes {
                id
                versionNumber
                versionCreatedAt
                versionCreatedBy {
                  email
                }
                versionComment
                versionIsAvailable
              }
            }
          }
        }
      `,
      variables: {
        integrationId: integration,
        onlyAvailable: flags["latest-available"] ? true : null,
        onlyShowOne: flags["latest-available"] ? 1 : null,
      },
    });

    ux.table(
      result.integration.versionSequence.nodes,
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
      { ...flags }
    );
  }
}

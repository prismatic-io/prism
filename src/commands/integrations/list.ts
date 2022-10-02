import { Command, Flags, CliUx } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class ListCommand extends Command {
  static description = "List Integrations";
  static flags = {
    ...CliUx.ux.table.flags(),
    showAllVersions: Flags.boolean({
      char: "a",
      description:
        "If specified this command returns all versions of all integrations rather than only the latest version",
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { showAllVersions } = flags;

    let integrations: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        integrations: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listIntegrations($showAllVersions: Boolean, $after: String) {
            integrations(allVersions: $showAllVersions, after: $after) {
              nodes {
                id
                name
                description
                versionNumber
                labels
                category
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
        },
      });
      integrations = [...integrations, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    CliUx.ux.table(
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
      },
      { ...flags }
    );
  }
}

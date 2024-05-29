import { Command, Flags, ux } from "@oclif/core";
import dayjs from "dayjs";
import { gqlRequest, gql } from "../../../graphql.js";

export default class ListCommand extends Command {
  static description = "List available connections";
  static flags = {
    ...ux.table.flags(),
    showAllVersions: Flags.boolean({
      char: "a",
      required: false,
      description:
        "If specified this command returns all connections associated to existing components",
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { showAllVersions } = flags;

    let components: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        components: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listComponents($showAllVersions: Boolean, $after: String) {
            components(allVersions: $showAllVersions, after: $after, hasConnections: true) {
              nodes {
                id
                label
                connections {
                  edges {
                    node {
                      id
                      label
                    }
                  }
                }
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
      components = [...components, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      components,
      {
        component: {
          get: ({ label }) => label ?? "",
        },
        label: {
          get: ({ connections }) => connections.edges[0]?.node.label ?? "",
        },
        id: {
          get: ({ connections }) => connections.edges[0]?.node.id ?? "",
        },
      },
      { ...flags },
    );
  }
}

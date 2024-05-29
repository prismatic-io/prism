import { Command, Flags, ux } from "@oclif/core";
import dayjs from "dayjs";
import { gqlRequest, gql } from "../../graphql.js";

export default class ListCommand extends Command {
  static description = "List available Components";
  static flags = {
    ...ux.table.flags(),
    showAllVersions: Flags.boolean({
      char: "a",
      required: false,
      description:
        "If specified this command returns all versions of all components rather than only the latest version",
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
            components(allVersions: $showAllVersions, after: $after) {
              nodes {
                id
                key
                public
                label
                description
                versionNumber
                category
                connections {
                  edges {
                    node {
                      id
                    }
                  }
                }
                versionCreatedAt
                customer {
                  id
                  externalId
                  name
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
        id: {
          minWidth: 8,
          extended: true,
        },
        key: {
          minWidth: 10,
          extended: true,
        },
        label: {},
        public: {},
        description: {},
        versionNumber: { header: "Version" },
        versionCreatedAt: {
          header: "Last Published",
          extended: true,
          get: ({ versionCreatedAt }) => dayjs(versionCreatedAt).format(),
        },
        category: { get: ({ category }) => category || "" },
        connectionIds: { get: ({ connections }) => connections.edges[0]?.node.id || "" },
        customerId: {
          extended: true,
          get: ({ customer }) => customer?.id ?? "",
        },
        customerName: {
          extended: true,
          get: ({ customer }) => customer?.name ?? "",
        },
        customerExternalId: {
          extended: true,
          get: ({ customer }) => customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
  }
}

import { Command, Flags, ux } from "@oclif/core";
import dayjs from "dayjs";
import { gqlRequest, gql } from "../../../graphql.js";

interface Connection {
  componentLabel: string;
  connectionId: string;
  connectionLabel: string;
}

interface Component {
  id: string;
  label: string;
  connections: {
    nodes: {
      id: string;
      label: string;
    }[];
  };
}

interface ComponentResponse {
  components: {
    nodes: Component[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

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

    let components: Component[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        components: { nodes, pageInfo },
      } = await gqlRequest<ComponentResponse>({
        document: gql`
          query listComponents($showAllVersions: Boolean, $after: String) {
            components(allVersions: $showAllVersions, after: $after, hasConnections: true) {
              nodes {
                id
                label
                connections {
                  nodes {
                    id
                    label
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

    const filteredConnections: Record<string, unknown>[] = [];

    components.forEach((component) => {
      component.connections.nodes.forEach((connection) => {
        filteredConnections.push({
          componentLabel: component.label,
          connectionId: connection.id,
          connectionLabel: connection.label,
        });
      });
    });

    ux.table(
      filteredConnections,
      {
        component: {
          get: ({ componentLabel }) => componentLabel ?? "",
        },
        label: {
          get: ({ connectionLabel }) => connectionLabel ?? "",
        },
        id: {
          get: ({ connectionId }) => connectionId ?? "",
        },
      },
      { ...flags },
    );
  }
}

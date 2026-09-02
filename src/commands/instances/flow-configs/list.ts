import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface InstanceFlowConfigNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  flow: { name: Scalars["String"]["output"] };
  webhookUrl: Scalars["String"]["output"];
}

interface ListInstanceFlowConfigsQuery {
  instance: {
    flowConfigs: {
      nodes: Array<InstanceFlowConfigNode | null>;
      pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
  };
}

const isInstanceFlowConfigNode = (
  node: InstanceFlowConfigNode | null,
): node is InstanceFlowConfigNode => node !== null;

export default defineCommand({
  description: "List Instance Flow Configs",
  args: {
    instance: arg.string({ description: "ID of an Instance", required: true }),
  },
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
      flags,
    } = commandInput();

    let flowConfigs: InstanceFlowConfigNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        instance: {
          flowConfigs: { nodes, pageInfo },
        },
      }: ListInstanceFlowConfigsQuery = await gqlRequest<ListInstanceFlowConfigsQuery>({
        document: gql`
          query listInstanceFlowConfigs($id: ID!, $after: String) {
            instance(id: $id) {
              flowConfigs(after: $after) {
                nodes {
                  id
                  flow {
                    name
                  }
                  webhookUrl
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `,
        variables: {
          id: instance,
          after: cursor,
        },
      });
      flowConfigs = [...flowConfigs, ...nodes.filter(isInstanceFlowConfigNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      flowConfigs,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row) => row.flow.name,
        },
        webhookUrl: {
          extended: true,
        },
      },
      { ...flags },
    );
  },
});

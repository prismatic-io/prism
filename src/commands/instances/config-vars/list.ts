import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface InstanceConfigVariableNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  value: unknown;
  status: Scalars["String"]["output"];
  inputs: { nodes: Array<{ name: string; value: unknown } | null> };
  requiredConfigVariable: {
    id: Scalars["ID"]["output"];
    key: Scalars["String"]["output"];
    defaultValue: unknown;
    dataType: Scalars["String"]["output"];
  };
}

interface ListInstanceConfigVariablesQuery {
  instance: {
    configVariables: {
      nodes: Array<InstanceConfigVariableNode | null>;
      pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
  };
}

const isInstanceConfigVariableNode = (
  node: InstanceConfigVariableNode | null,
): node is InstanceConfigVariableNode => node !== null;

export default defineCommand({
  description: "List Config Variables used on an Instance",
  args: {
    instance: arg.string({ description: "ID of an instance", required: true }),
  },
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
      flags,
    } = commandInput();

    let configVariables: InstanceConfigVariableNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        instance: {
          configVariables: { nodes, pageInfo },
        },
      }: ListInstanceConfigVariablesQuery = await gqlRequest<ListInstanceConfigVariablesQuery>({
        document: gql`
          query listInstanceConfigVariables($id: ID!) {
            instance(id: $id) {
              configVariables {
                nodes {
                  id
                  value
                  status
                  inputs {
                    nodes {
                      name
                      value
                    }
                  }
                  requiredConfigVariable {
                    id
                    key
                    defaultValue
                    dataType
                  }
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
      configVariables = [...configVariables, ...nodes.filter(isInstanceConfigVariableNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
      configVariables,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        requiredVariableId: {
          get: (row) => row.requiredConfigVariable.id,
          extended: true,
        },
        key: {
          get: (row) => row.requiredConfigVariable.key,
        },
        value: {
          get: (row) =>
            row.requiredConfigVariable.dataType === "CONNECTION" ? row.inputs : row.value,
        },
        defaultValue: {
          get: (row) =>
            row.requiredConfigVariable.dataType === "CONNECTION"
              ? ""
              : row.requiredConfigVariable.defaultValue,
        },
      },
      { ...flags },
    );
  },
});

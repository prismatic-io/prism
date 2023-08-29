import { Command, ux, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Config Variables used on an Instance";
  static args = {
    instance: Args.string({ description: "ID of an instance", required: true }),
  };

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { instance },
      flags,
    } = await this.parse(ListCommand);

    let configVariables: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        instance: {
          configVariables: { nodes, pageInfo },
        },
      } = await gqlRequest({
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
      configVariables = [...configVariables, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      configVariables,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        requiredVariableId: {
          get: (row: any) => row.requiredConfigVariable.id,
          extended: true,
        },
        key: {
          get: (row: any) => row.requiredConfigVariable.key,
        },
        value: {
          get: (row: any) =>
            row.requiredConfigVariable.dataType === "CONNECTION"
              ? row.inputs
              : row.value,
        },
        defaultValue: {
          get: (row: any) =>
            row.requiredConfigVariable.dataType === "CONNECTION"
              ? ""
              : row.requiredConfigVariable.defaultValue,
        },
      },
      { ...flags }
    );
  }
}

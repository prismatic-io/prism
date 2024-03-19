import { Command, ux, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends Command {
  static description = "List Instance Flow Configs";
  static args = {
    instance: Args.string({ description: "ID of an Instance", required: true }),
  };
  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { instance },
      flags,
    } = await this.parse(ListCommand);

    let flowConfigs: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        instance: {
          flowConfigs: { nodes, pageInfo },
        },
      } = await gqlRequest({
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
      flowConfigs = [...flowConfigs, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      flowConfigs,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row: any) => row.flow.name,
        },
        webhookUrl: {
          extended: true,
        },
      },
      { ...flags },
    );
  }
}

import { Command, Args, ux } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Integration Flows";
  static args = {
    integration: Args.string({
      description: "ID of an Integration",
      required: true,
    }),
  };
  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { integration },
      flags,
    } = await this.parse(ListCommand);

    let flows: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        integration: {
          flows: { nodes, pageInfo },
        },
      } = await gqlRequest({
        document: gql`
          query listIntegrationFlows($id: ID!, $after: String) {
            integration(id: $id) {
              flows(after: $after) {
                nodes {
                  id
                  name
                  description
                  testUrl
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
          id: integration,
          after: cursor,
        },
      });
      flows = [...flows, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      flows,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
        testUrl: { header: "Test URL", extended: true },
      },
      { ...flags }
    );
  }
}

import { Command, ux } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql.js";

export default class ListCommand extends Command {
  static description = "List Alert Groups in your Organization";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let alertGroups: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        alertGroups: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listAlertGroups($after: String) {
            alertGroups(after: $after) {
              nodes {
                id
                name
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: { after: cursor },
      });
      alertGroups = [...alertGroups, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      alertGroups,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
      },
      { ...flags },
    );
  }
}

import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Groups in your Organization";

  static examples = [
    {
      description:
        "Fetch the ID and Name of all alert groups in JSON format, sorted descending by name:",
      command: '<%= config.bin %> <%= command.id %> --columns "id,name" --output json --sort name',
    },
  ];

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

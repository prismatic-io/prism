import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface AlertGroupNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
}

interface ListAlertGroupsQuery {
  alertGroups: {
    nodes: Array<AlertGroupNode | null>;
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

const isAlertGroupNode = (node: AlertGroupNode | null): node is AlertGroupNode => node !== null;

export default defineCommand({
  description: "List Alert Groups in your Organization",
  examples: [
    {
      description:
        "Fetch the ID and Name of all alert groups in JSON format, sorted descending by name:",
      command: '<%= config.bin %> <%= command.id %> --columns "id,name" --output json --sort name',
    },
  ],
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    let alertGroups: AlertGroupNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertGroups: { nodes, pageInfo },
      }: ListAlertGroupsQuery = await gqlRequest<ListAlertGroupsQuery>({
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
      alertGroups = [...alertGroups, ...nodes.filter(isAlertGroupNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});

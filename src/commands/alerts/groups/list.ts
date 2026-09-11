import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListAlertGroupsDocument as LIST_ALERT_GROUPS,
  type ListAlertGroupsQuery,
} from "../../../graphql/alerts/listAlertGroups.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

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

    let alertGroups: AlertGroupNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertGroups: { nodes, pageInfo },
      }: ListAlertGroupsQuery = await gqlRequest({
        document: LIST_ALERT_GROUPS,
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

type AlertGroupNode = ListAlertGroupsQuery["alertGroups"]["nodes"][number];

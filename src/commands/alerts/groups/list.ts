import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListAlertGroupsDocument as LIST_ALERT_GROUPS } from "../../../graphql/alerts/listAlertGroups.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

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
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        alertGroups: { nodes, pageInfo },
      }: ResultOf<typeof LIST_ALERT_GROUPS> = await gqlRequest({
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

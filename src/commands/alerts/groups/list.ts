import type { ListAlertGroupsQuery } from "../../../graphql/alerts/listAlertGroups.generated.js";
import { ListAlertGroupsDocument as LIST_ALERT_GROUPS } from "../../../graphql/alerts/listAlertGroups.generated.js";
import { gqlRequest } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";

type AlertGroupNode = ListAlertGroupsQuery["alertGroups"]["nodes"][number];

const isAlertGroupNode = (node: AlertGroupNode | null): node is AlertGroupNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name"], true),
  description: "List Alert Groups in your Organization",
  examples: [
    {
      description:
        "Fetch the ID and Name of all alert groups in JSON format, sorted descending by name:",
      options: { columns: "id,name", output: "json", sort: "name" },
    },
  ],
  options: z.object({ ...tableFlags(), ...paginationFlags() }),
  async run(context) {
    const { options: flags } = context;

    let alertGroups: AlertGroupNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        alertGroups: { nodes, pageInfo },
      }: ListAlertGroupsQuery = await gqlRequest({
        document: LIST_ALERT_GROUPS,
        variables: { after: cursor, first: flags.first },
      });
      alertGroups = [...alertGroups, ...nodes.filter(isAlertGroupNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
    return { ...result, pageInfo: finalPageInfo };
  },
});

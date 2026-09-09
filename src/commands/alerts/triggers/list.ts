import { tableOutputSchema, tableFlags, printTable } from "../../../utils/table.js";
import { ListAlertTriggersDocument as LIST_ALERT_TRIGGERS } from "../../../graphql/operations/listAlertTriggers.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { z, Cli } from "incur";
export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name"]),
  description: "List Alert Triggers",
  options: z.object({ ...tableFlags() }),
  async run(context) {
    const { options: flags } = context;

    const result = await gqlRequest({
      document: LIST_ALERT_TRIGGERS,
    });

    return printTable(
      result.alertTriggers.nodes,
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

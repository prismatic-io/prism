import { ListLogSeverityLevelsDocument as LIST_LOG_SEVERITY_LEVELS } from "../../../graphql/operations/listLogSeverityLevels.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { z, Cli } from "incur";
import { tableFlags, printTable } from "../../../utils/table.js";

export default Cli.command({
  outputPolicy: "agent-only",
  output: z.object({
    items: z.array(
      z.object({
        id: z.number().int().nullable().optional(),
        name: z.string().nullable().optional(),
      }),
    ),
  }),
  description: "List Log Severities for use by Alert Triggers",
  options: z.object({ ...tableFlags() }),
  async run(context) {
    const { options: flags } = context;

    const result = await gqlRequest({
      document: LIST_LOG_SEVERITY_LEVELS,
    });

    return printTable(
      result.logSeverityLevels,
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

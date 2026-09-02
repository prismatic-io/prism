import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  description: "List Log Severities for use by Alert Triggers",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    const result = await gqlRequest({
      document: gql`
        query listLogSeverityLevels {
          logSeverityLevels {
            id
            name
          }
        }
      `,
    });

    return ux.table(
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

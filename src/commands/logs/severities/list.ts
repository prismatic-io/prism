import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListLogSeverityLevelsDocument as LIST_LOG_SEVERITY_LEVELS } from "../../../graphql/operations/listLogSeverityLevels.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Log Severities for use by Alert Triggers";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_LOG_SEVERITY_LEVELS> = await gqlRequest({
      document: LIST_LOG_SEVERITY_LEVELS,
    });

    ux.table(
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
  }
}

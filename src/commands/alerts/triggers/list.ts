import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListAlertTriggersDocument as LIST_ALERT_TRIGGERS } from "../../../graphql/operations/listAlertTriggers.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Triggers";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_ALERT_TRIGGERS> = await gqlRequest({
      document: LIST_ALERT_TRIGGERS,
    });

    ux.table(
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
  }
}

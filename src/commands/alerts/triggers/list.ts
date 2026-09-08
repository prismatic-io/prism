import { tableOutputSchema } from "../../../utils/table.js";
import { ListAlertTriggersDocument as LIST_ALERT_TRIGGERS } from "../../../graphql/operations/listAlertTriggers.generated.js";
import { defineCommand, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name"]),
  description: "List Alert Triggers",
  options: optionsSchema(z.object({ ...ux.table.flags() })),
  async run(context) {
    const { options: flags } = context;

    const result: ResultOf<typeof LIST_ALERT_TRIGGERS> = await gqlRequest({
      document: LIST_ALERT_TRIGGERS,
    });

    return ux.table(
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

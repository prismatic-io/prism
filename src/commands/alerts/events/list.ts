import { tableOutputSchema } from "../../../utils/table.js";
import { ListAlertEventsDocument as LIST_ALERT_EVENTS } from "../../../graphql/operations/listAlertEvents.generated.js";
import { defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

type AlertEvent = {
  createdAt: unknown;
  details: unknown;
  id: unknown;
  monitor: { name: unknown };
};

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "createdAt", "details"]),
  description: "List Alert Events for an Alert Monitor",
  args: argsSchema(
    z.object({
      alertMonitorId: z.string().describe("ID of an alert monitor"),
    }),
  ),
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
    }),
  ),
  async run(context) {
    const {
      options: flags,
      args: { alertMonitorId },
    } = context;

    const result: ResultOf<typeof LIST_ALERT_EVENTS> = await gqlRequest({
      document: LIST_ALERT_EVENTS,
      variables: {
        alertMonitorId,
      },
    });

    return ux.table(
      result.alertEvents.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row: AlertEvent) => row.monitor.name,
          header: "Name",
        },
        createdAt: {
          header: "Timestamp",
        },
        details: {},
      },
      { ...flags },
    );
  },
});

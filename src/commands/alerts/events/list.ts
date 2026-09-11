import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { ListAlertEventsDocument as LIST_ALERT_EVENTS } from "../../../graphql/operations/listAlertEvents.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Events for an Alert Monitor";
  static args = {
    alertMonitorId: Args.string({
      description: "ID of an alert monitor",
      required: true,
    }),
  };
  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      flags,
      args: { alertMonitorId },
    } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: LIST_ALERT_EVENTS,
      variables: {
        alertMonitorId,
      },
    });

    ux.table(
      result.alertEvents.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row) => row.monitor.name,
          header: "Name",
        },
        createdAt: {
          header: "Timestamp",
        },
        details: {},
      },
      { ...flags },
    );
  }
}

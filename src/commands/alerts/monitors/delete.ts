import { DeleteAlertMonitorDocument as DELETE_ALERT_MONITOR } from "../../../graphql/operations/deleteAlertMonitor.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Alert Monitor";
  static args = {
    monitor: Args.string({
      required: true,
      description: "ID of the monitor to delete",
    }),
  };

  async run() {
    const {
      args: { monitor },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_ALERT_MONITOR,
      variables: {
        id: monitor,
      },
    });
  }
}

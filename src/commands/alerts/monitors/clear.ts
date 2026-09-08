import { ClearAlertMonitorDocument as CLEAR_ALERT_MONITOR } from "../../../graphql/operations/clearAlertMonitor.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class ClearCommand extends PrismaticBaseCommand {
  static description = "Clear an Alert Monitor";
  static args = {
    monitor: Args.string({
      required: true,
      description: "ID of the monitor to clear",
    }),
  };

  async run() {
    const {
      args: { monitor },
    } = await this.parse(ClearCommand);

    await gqlRequest({
      document: CLEAR_ALERT_MONITOR,
      variables: {
        id: monitor,
      },
    });
  }
}

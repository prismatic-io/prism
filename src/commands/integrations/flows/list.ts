import { Args, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { getIntegrationFlows } from "../../../utils/integration/flows.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Integration Flows";
  static args = {
    integration: Args.string({
      description: "ID of an Integration",
      required: true,
    }),
  };
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { integration },
      flags,
    } = await this.parse(ListCommand);

    const flows = await getIntegrationFlows(integration);

    if (flags.json) {
      this.logJsonOutput(flows);
    } else {
      ux.table(
        flows,
        {
          id: {
            minWidth: 8,
            extended: true,
          },
          name: {},
          description: {},
          testUrl: { header: "Test URL", extended: true },
        },
        { ...flags },
      );
    }
  }
}

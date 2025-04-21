import { Args, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { listIntegrationFlows } from "../../../utils/integration/flows.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Integration Flows";
  static args = {
    integration: Args.string({
      description: "ID of an Integration",
      required: true,
    }),
  };
  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { integration },
      flags,
    } = await this.parse(ListCommand);

    const flows = await listIntegrationFlows(integration);

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

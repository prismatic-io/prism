import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { openIntegration } from "../../utils/integration/open.js";

export default class OpenCommand extends PrismaticBaseCommand {
  static description = "Open the Designer for the specified Integration";
  static args = {
    integrationId: Args.string({
      required: true,
      description: "ID of the integration to open",
    }),
  };

  async run() {
    const {
      args: { integrationId },
    } = await this.parse(OpenCommand);

    await openIntegration(integrationId);
  }
}

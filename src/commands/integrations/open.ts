import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { openIntegration } from "../../utils/integration/open.js";

export default defineCommand({
  description: "Open the Designer for the specified Integration",
  args: {
    integrationId: arg.string({
      required: true,
      description: "ID of the integration to open",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integrationId },
    } = commandInput();

    await openIntegration(integrationId);
  },
});

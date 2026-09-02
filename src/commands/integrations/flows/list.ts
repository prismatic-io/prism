import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { getIntegrationFlows } from "../../../utils/integration/flows.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  description: "List Integration Flows",
  args: {
    integration: arg.string({
      description: "ID of an Integration",
      required: true,
    }),
  },
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags,
    } = commandInput();

    const flows = await getIntegrationFlows(integration);

    return ux.table(
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
  },
});

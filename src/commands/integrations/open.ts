import { Cli, z } from "incur";
import { openIntegration } from "../../utils/integration/open.js";

export default Cli.command({
  output: z.object({ integrationId: z.string(), opened: z.literal(true) }),
  description: "Open the Designer for the specified Integration",
  args: z.object({
    integrationId: z.string().describe("ID of the integration to open"),
  }),
  async run(context) {
    const {
      args: { integrationId },
    } = context;

    await openIntegration(integrationId);
    return { integrationId, opened: true as const };
  },
});

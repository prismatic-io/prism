import { openIntegration } from "../../utils/integration/open.js";
import { z, Cli } from "incur";

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

import { defineCommand, argsSchema } from "../../command.js";
import { openIntegration } from "../../utils/integration/open.js";
import { z } from "incur";

export default defineCommand({
  output: z.object({ integrationId: z.string(), opened: z.literal(true) }),
  mutates: true,
  description: "Open the Designer for the specified Integration",
  args: argsSchema(
    z.object({
      integrationId: z.string().describe("ID of the integration to open"),
    }),
  ),
  async run(context) {
    const {
      args: { integrationId },
    } = context;

    await openIntegration(integrationId);
    return { integrationId, opened: true as const };
  },
});

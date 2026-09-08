import { defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { getIntegrationFlowsPage } from "../../../utils/integration/flows.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "description", "testUrl"], true),
  description: "List Integration Flows",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an Integration"),
    }),
  ),
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
      ...paginationFlags(),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: flags,
    } = context;

    const { flows, pageInfo } = await getIntegrationFlowsPage(integration, {
      after: flags.after,
      all: flags.all === true || !context.agent,
      first: flags.first,
    });

    const result = ux.table(
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
    return { ...result, pageInfo };
  },
});

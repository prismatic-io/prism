import { getIntegrationFlowsPage } from "../../../utils/integration/flows.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "description", "testUrl"], true),
  description: "List Integration Flows",
  args: z.object({
    integration: z.string().describe("ID of an Integration"),
  }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
  }),
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

    const result = printTable(
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

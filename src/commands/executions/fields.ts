import { Cli, z } from "incur";
import { requestFailure } from "../../utils/failure.js";
import { resolveEngine } from "../../utils/search/engine.js";
import {
  EXECUTION_RETENTION_MS,
  listExecutionFilterFields,
} from "../../utils/search/executions.js";
import { resolveWindow } from "../../utils/search/window.js";
import { printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { windowOptions } from "./flags.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description:
    "List the fields you can filter executions by, including trigger payload keys discovered in your data",
  output: tableOutputSchema(["keyPath", "dataType", "operators"], false),
  examples: [
    { description: "Every filterable field:" },
    { description: "Trigger payload keys that mention 'order':", options: { search: "order" } },
    {
      description: "Payload keys seen on one instance:",
      options: { instance: "SW5zdGFuY2U6...", search: "triggerPayload" },
    },
  ],
  options: z.object({
    ...tableFlags(),
    ...windowOptions("14d"),
    search: z.string().optional().describe("Only include fields whose key path contains this text"),
    instance: z.string().optional().describe("Discover payload keys from this instance ID"),
    customer: z.string().optional().describe("Discover payload keys from this customer ID"),
    integration: z.string().optional().describe("Discover payload keys from this integration ID"),
  }),
  alias: { search: "s" },
  async run(context) {
    const { options: flags } = context;
    try {
      const engine = await resolveEngine();
      const window =
        flags.since || flags.until
          ? resolveWindow(flags, EXECUTION_RETENTION_MS, { maxAgeMs: EXECUTION_RETENTION_MS })
          : undefined;
      const fields = await listExecutionFilterFields(
        engine,
        {
          instanceId: flags.instance,
          customerId: flags.customer,
          integrationId: flags.integration,
          keySearch: flags.search,
        },
        window,
      );
      const result = printTable(
        fields,
        {
          keyPath: { header: "Key Path", minWidth: 20 },
          dataType: { header: "Type" },
          operators: { get: ({ operators }) => operators.join(", ") },
        },
        { ...flags },
      );
      return context.ok(result);
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_FIELDS_FAILED", true));
    }
  },
});

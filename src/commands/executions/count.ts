import { Cli, z } from "incur";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { requestFailure } from "../../utils/failure.js";
import { resolveEngine } from "../../utils/search/engine.js";
import { countExecutions, EXECUTION_RETENTION_MS } from "../../utils/search/executions.js";
import { optionalConditions } from "../../utils/search/filters.js";
import { DAY_MS, resolveWindow } from "../../utils/search/window.js";
import {
  includeTestsOption,
  noteEngine,
  scopeConditions,
  scopeOptions,
  whereConditions,
  whereOption,
  windowOptions,
} from "./flags.js";

export default Cli.command({
  description: "Count executions that match a search",
  output: z.object({
    count: z.number().int(),
    since: z.string(),
    until: z.string(),
    engine: z.enum(["search", "legacy"]),
  }),
  examples: [
    { description: "Failed executions in the last 24 hours:", options: { status: "error" } },
    {
      description: "Executions of one customer in the last 7 days:",
      options: { customer: "Q3VzdG9tZXI6...", since: "7d" },
    },
  ],
  options: z.object({
    ...windowOptions("24h"),
    ...scopeOptions(),
    ...includeTestsOption(),
    status: z
      .enum(["pending", "success", "error", "queued", "canceling", "canceled"])
      .optional()
      .describe("Only count executions with this status"),
    ...whereOption("executions"),
  }),
  alias: { where: "w" },
  async run(context) {
    const { options: flags } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const window = resolveWindow(flags, DAY_MS, {
        maxAgeMs: engine === "search" ? EXECUTION_RETENTION_MS : undefined,
      });
      const count = await countExecutions(engine, {
        window,
        includeTests: flags.includeTests === true,
        conditions: [
          ...scopeConditions(flags),
          ...optionalConditions([["status", FilterOperator.Eq, flags.status]]),
          ...whereConditions(flags.where),
        ],
      });
      return context.ok({
        count,
        since: window.start.toISOString(),
        until: window.end.toISOString(),
        engine,
      });
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_COUNT_FAILED", true));
    }
  },
});

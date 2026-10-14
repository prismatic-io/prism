import dayjs from "dayjs";
import { Cli, z } from "incur";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { requestFailure } from "../../utils/failure.js";
import { nextPageCta } from "../../utils/pagination.js";
import { resolveEngine } from "../../utils/search/engine.js";
import { LEGACY_LOG_WINDOW_MS, searchLogs } from "../../utils/search/events.js";
import { EXECUTION_RETENTION_MS } from "../../utils/search/executions.js";
import { optionalConditions } from "../../utils/search/filters.js";
import { HOUR_MS, resolveWindow } from "../../utils/search/window.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import {
  directionOption,
  includeTestsOption,
  noteEngine,
  scopeConditions,
  scopeOptions,
  whereConditions,
  whereOption,
  windowOptions,
} from "../executions/flags.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "Search logs across executions",
  output: tableOutputSchema(
    [
      "id",
      "timestamp",
      "severity",
      "message",
      "instanceName",
      "flowName",
      "stepName",
      "executionId",
      "customerName",
      "integrationName",
      "logType",
      "instanceId",
    ],
    true,
  ).extend({ engine: z.enum(["search", "legacy"]), totalCount: z.number().int().nullable() }),
  examples: [
    { description: "Errors in the last hour:", options: { severity: "error" } },
    {
      description: "Logs of one instance that mention a request ID:",
      options: { instance: "SW5zdGFuY2U6...", message: "req_8f3a", since: "6h" },
    },
    { description: "Connection logs only:", options: { type: "connection" } },
  ],
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...windowOptions("1h"),
    ...scopeOptions(),
    ...includeTestsOption(),
    ...directionOption("desc"),
    execution: z.string().optional().describe("Only include logs of this execution ID"),
    severity: z
      .string()
      .optional()
      .describe(
        "Only include logs at this severity (fatal, error, warn, info, debug, trace, metric)",
      ),
    message: z.string().optional().describe("Only include logs whose message contains this text"),
    type: z
      .string()
      .optional()
      .describe(
        "Only include this log type (execution, connection, data_source, server_function, management, rate_limit)",
      ),
    ...whereOption("logs"),
  }),
  alias: { where: "w", message: "m" },
  async run(context) {
    const { options: flags } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const window = resolveWindow(
        flags,
        HOUR_MS,
        engine === "search"
          ? { maxAgeMs: EXECUTION_RETENTION_MS }
          : { maxSpanMs: LEGACY_LOG_WINDOW_MS },
      );
      const page = await searchLogs(engine, {
        window,
        includeTests: flags.includeTests === true,
        direction: flags.direction,
        first: flags.first,
        after: flags.after,
        conditions: [
          ...scopeConditions(flags),
          ...optionalConditions([
            ["executionId", FilterOperator.Eq, flags.execution],
            ["severity", FilterOperator.Eq, flags.severity],
            ["message", FilterOperator.Contains, flags.message],
            ["logType", FilterOperator.Eq, flags.type],
          ]),
          ...whereConditions(flags.where),
        ],
      });
      const result = printTable(
        page.items,
        {
          id: { minWidth: 8, extended: true },
          timestamp: { header: "Time", get: ({ timestamp }) => dayjs(timestamp).format() },
          severity: {},
          message: {},
          instanceName: { header: "Instance" },
          flowName: { header: "Flow" },
          stepName: { header: "Step", extended: true },
          executionId: { header: "Execution", extended: true },
          customerName: { header: "Customer", extended: true },
          integrationName: { header: "Integration", extended: true },
          logType: { header: "Type", extended: true },
          instanceId: { extended: true },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo: page.pageInfo, engine: page.engine, totalCount: page.totalCount },
        nextPageCta(
          "logs list",
          undefined,
          flags,
          page.pageInfo,
          context.agent,
          "Fetch the next page of logs",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "LOG_SEARCH_FAILED", true));
    }
  },
});

import dayjs from "dayjs";
import { Cli, z } from "incur";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { requestFailure } from "../../utils/failure.js";
import { nextPageCta } from "../../utils/pagination.js";
import { resolveEngine } from "../../utils/search/engine.js";
import { listExecutionLogs } from "../../utils/search/events.js";
import { optionalConditions } from "../../utils/search/filters.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { directionOption, noteEngine, whereConditions, whereOption } from "./flags.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "Read the logs one execution wrote",
  output: tableOutputSchema(
    [
      "id",
      "timestamp",
      "severity",
      "message",
      "stepName",
      "loopStepName",
      "loopStepIndex",
      "logType",
    ],
    true,
  ).extend({ engine: z.enum(["search", "legacy"]), totalCount: z.number().int().nullable() }),
  examples: [
    {
      description: "All logs of an execution:",
      args: { executionId: "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6..." },
    },
    {
      description: "Only errors, newest first:",
      args: { executionId: "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6..." },
      options: { severity: "error", direction: "desc" },
    },
  ],
  args: z.object({ executionId: z.string().describe("The ID of the execution") }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...directionOption("asc"),
    severity: z
      .string()
      .optional()
      .describe(
        "Only include logs at this severity (fatal, error, warn, info, debug, trace, metric)",
      ),
    message: z.string().optional().describe("Only include logs whose message contains this text"),
    step: z
      .string()
      .optional()
      .describe("Only include logs written by this step name (modern API only)"),
    ...whereOption("logs"),
  }),
  alias: { where: "w", message: "m" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const page = await listExecutionLogs(engine, args.executionId, {
        conditions: [
          ...optionalConditions([
            ["severity", FilterOperator.Eq, flags.severity],
            ["message", FilterOperator.Contains, flags.message],
            ["stepName", FilterOperator.Eq, flags.step],
          ]),
          ...whereConditions(flags.where),
        ],
        direction: flags.direction,
        first: flags.first,
        after: flags.after,
      });
      const result = printTable(
        page.items,
        {
          id: { minWidth: 8, extended: true },
          timestamp: {
            header: "Time",
            get: ({ timestamp }) => dayjs(timestamp).format("HH:mm:ss.SSS"),
          },
          severity: {},
          message: {},
          stepName: { header: "Step" },
          loopStepName: { header: "Loop", extended: true },
          loopStepIndex: { header: "Iteration", extended: true },
          logType: { header: "Type", extended: true },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo: page.pageInfo, engine: page.engine, totalCount: page.totalCount },
        nextPageCta(
          "executions logs",
          { executionId: args.executionId },
          flags,
          page.pageInfo,
          context.agent,
          "Fetch the next page of logs",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_LOGS_FAILED", true));
    }
  },
});

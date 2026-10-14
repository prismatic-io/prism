import dayjs from "dayjs";
import { Cli, z } from "incur";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { requestFailure } from "../../utils/failure.js";
import { nextPageCta } from "../../utils/pagination.js";
import { resolveEngine } from "../../utils/search/engine.js";
import {
  EXECUTION_RETENTION_MS,
  executionSortFields,
  searchExecutions,
} from "../../utils/search/executions.js";
import { optionalConditions } from "../../utils/search/filters.js";
import { DAY_MS, resolveWindow } from "../../utils/search/window.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
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
  outputPolicy: "agent-only",
  description: "Search executions across your instances",
  output: tableOutputSchema(
    [
      "id",
      "status",
      "startedAt",
      "durationMs",
      "invokeType",
      "resultType",
      "instanceName",
      "customerName",
      "integrationName",
      "flowName",
      "error",
      "errorStepName",
      "stepCount",
      "retryAttemptNumber",
      "endedAt",
      "instanceId",
      "customerId",
      "integrationId",
      "flowId",
      "isTestExecution",
      "allowReplay",
    ],
    true,
  ).extend({ engine: z.enum(["search", "legacy"]) }),
  examples: [
    { description: "Failed executions in the last 24 hours:", options: { status: "error" } },
    {
      description: "Executions of one instance in the last week, slowest first:",
      options: { instance: "SW5zdGFuY2U6...", since: "7d", orderBy: "durationMs" },
    },
    {
      description: "Executions whose trigger payload carried a given order ID:",
      options: { payload: ["order.id=12345"] },
    },
    {
      description: "Executions whose error mentions a timeout:",
      options: { where: ["error~timeout"] },
    },
  ],
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...windowOptions("24h"),
    ...scopeOptions(),
    ...includeTestsOption(),
    status: z
      .enum(["pending", "success", "error", "queued", "canceling", "canceled"])
      .optional()
      .describe("Only include executions with this status"),
    result: z
      .string()
      .optional()
      .describe(
        "Only include executions with this result type (completed, error, polled_no_changes, canceled_as_duplicate, canceled_by_user)",
      ),
    invokeType: z
      .string()
      .optional()
      .describe("Only include executions started this way (webhook, scheduled, cross_flow, ...)"),
    error: z.string().optional().describe("Only include executions whose error contains this text"),
    payload: z
      .array(z.string())
      .optional()
      .describe(
        "Only include executions whose trigger payload matches key=value or key~text (modern API only). Repeatable.",
      ),
    ...whereOption("executions"),
    orderBy: z
      .enum(executionSortFields as [string, ...string[]])
      .default("startedAt")
      .describe("Field to order by"),
    desc: z.boolean().default(true).describe("Order descending (use --no-desc for ascending)"),
  }),
  alias: { where: "w", status: "S" },
  async run(context) {
    const { options: flags } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const window = resolveWindow(flags, DAY_MS, {
        maxAgeMs: engine === "search" ? EXECUTION_RETENTION_MS : undefined,
      });
      const conditions = [
        ...scopeConditions(flags),
        ...optionalConditions([
          ["status", FilterOperator.Eq, flags.status],
          ["resultType", FilterOperator.Eq, flags.result],
          ["invokeType", FilterOperator.Eq, flags.invokeType],
          ["error", FilterOperator.Contains, flags.error],
        ]),
        ...whereConditions(flags.payload?.map((item) => `triggerPayload.${item}`)),
        ...whereConditions(flags.where),
      ];
      const page = await searchExecutions(engine, {
        window,
        conditions,
        includeTests: flags.includeTests === true,
        sort: { field: flags.orderBy, direction: flags.desc ? "desc" : "asc" },
        first: flags.first,
        after: flags.after,
      });
      const result = printTable(
        page.items,
        {
          id: { minWidth: 8, extended: true },
          status: {},
          startedAt: { header: "Started", get: ({ startedAt }) => dayjs(startedAt).format() },
          durationMs: { header: "Duration (ms)" },
          invokeType: { header: "Invoked By" },
          resultType: { header: "Result" },
          instanceName: { header: "Instance" },
          customerName: { header: "Customer" },
          integrationName: { header: "Integration", extended: true },
          flowName: { header: "Flow", extended: true },
          error: {},
          errorStepName: { header: "Failed Step", extended: true },
          stepCount: { header: "Steps", extended: true },
          retryAttemptNumber: { header: "Retry", extended: true },
          endedAt: { extended: true },
          instanceId: { extended: true },
          customerId: { extended: true },
          integrationId: { extended: true },
          flowId: { extended: true },
          isTestExecution: { extended: true },
          allowReplay: { extended: true },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo: page.pageInfo, engine: page.engine },
        nextPageCta(
          "executions list",
          undefined,
          flags,
          page.pageInfo,
          context.agent,
          "Fetch the next page of executions",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_SEARCH_FAILED", true));
    }
  },
});

import dayjs from "dayjs";
import { Cli, z } from "incur";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { requestFailure } from "../../utils/failure.js";
import { nextPageCta } from "../../utils/pagination.js";
import { resolveEngine } from "../../utils/search/engine.js";
import { listExecutionSteps } from "../../utils/search/events.js";
import { optionalConditions } from "../../utils/search/filters.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { directionOption, noteEngine, whereConditions, whereOption } from "./flags.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List the steps an execution ran",
  output: tableOutputSchema(
    [
      "id",
      "stepName",
      "displayName",
      "startedAt",
      "durationMs",
      "hasError",
      "errorCode",
      "componentKey",
      "actionKey",
      "branchName",
      "loopStepName",
      "loopStepIndex",
      "isLoopStep",
      "loopIterationCount",
      "hasStoredPayload",
    ],
    true,
  ).extend({ engine: z.enum(["search", "legacy"]), totalCount: z.number().int().nullable() }),
  examples: [
    {
      description: "Steps of an execution:",
      args: { executionId: "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6..." },
    },
    {
      description: "Only the steps that failed:",
      args: { executionId: "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6..." },
      options: { failed: true },
    },
  ],
  args: z.object({ executionId: z.string().describe("The ID of the execution") }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...directionOption("asc"),
    failed: z.boolean().optional().describe("Only include steps that failed"),
    ...whereOption("steps"),
  }),
  alias: { where: "w" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const page = await listExecutionSteps(engine, args.executionId, {
        conditions: [
          ...optionalConditions([["hasError", FilterOperator.Eq, flags.failed]]),
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
          stepName: { header: "Step" },
          displayName: { header: "Label", extended: true },
          startedAt: {
            header: "Started",
            get: ({ startedAt }) => (startedAt ? dayjs(startedAt).format("HH:mm:ss.SSS") : ""),
          },
          durationMs: { header: "Duration (ms)" },
          hasError: { header: "Failed" },
          errorCode: { extended: true },
          componentKey: { header: "Component", extended: true },
          actionKey: { header: "Action", extended: true },
          branchName: { header: "Branch", extended: true },
          loopStepName: { header: "Loop", extended: true },
          loopStepIndex: { header: "Iteration", extended: true },
          isLoopStep: { extended: true },
          loopIterationCount: { extended: true },
          hasStoredPayload: { extended: true },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo: page.pageInfo, engine: page.engine, totalCount: page.totalCount },
        nextPageCta(
          "executions steps",
          { executionId: args.executionId },
          flags,
          page.pageInfo,
          context.agent,
          "Fetch the next page of steps",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_STEPS_FAILED", true));
    }
  },
});

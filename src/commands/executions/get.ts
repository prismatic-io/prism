import { Cli, z } from "incur";
import { requestFailure } from "../../utils/failure.js";
import { resolveEngine } from "../../utils/search/engine.js";
import { getExecution } from "../../utils/search/executions.js";
import { noteEngine } from "./flags.js";

export default Cli.command({
  description:
    "Describe one execution: outcome, timing, lineage, trigger payload, and step summary",
  output: z.object({
    id: z.string(),
    status: z.string(),
    engine: z.enum(["search", "legacy"]),
    resultType: z.string().nullable(),
    invokeType: z.string().nullable(),
    startedAt: z.string(),
    endedAt: z.string().nullable(),
    queuedAt: z.string().nullable(),
    resumedAt: z.string().nullable(),
    durationMs: z.number().int().nullable(),
    stepCount: z.number().int().nullable(),
    error: z.string().nullable(),
    errorStepName: z.string().nullable(),
    instanceId: z.string().nullable(),
    instanceName: z.string().nullable(),
    instanceType: z.string().nullable(),
    customerId: z.string().nullable(),
    customerName: z.string().nullable(),
    customerExternalId: z.string().nullable(),
    integrationId: z.string().nullable(),
    integrationName: z.string().nullable(),
    integrationVersionSequenceId: z.string().nullable(),
    flowId: z.string().nullable(),
    flowName: z.string().nullable(),
    flowStableId: z.string().nullable(),
    flowConfigId: z.string().nullable(),
    isTestExecution: z.boolean().nullable(),
    isReplay: z.boolean().nullable(),
    isCodeNative: z.boolean().nullable(),
    usesBatching: z.boolean().nullable(),
    fromPreprocessFlow: z.boolean().nullable(),
    retryAttemptNumber: z.number().int().nullable(),
    retryForExecutionId: z.string().nullable(),
    invokedByExecutionId: z.string().nullable(),
    allowReplay: z.boolean(),
    payload: z.unknown().optional(),
    payloadTruncated: z.boolean().nullable(),
    hasStoredPayload: z.boolean(),
    stepBuckets: z.array(
      z.object({
        index: z.number().int(),
        startedAt: z.string(),
        endedAt: z.string(),
        count: z.number().int(),
        failedCount: z.number().int(),
        totalDurationMs: z.number(),
        firstLabel: z.string().nullable(),
        lastLabel: z.string().nullable(),
      }),
    ),
  }),
  examples: [
    {
      description: "Describe an execution:",
      args: { executionId: "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6..." },
    },
  ],
  args: z.object({ executionId: z.string().describe("The ID of the execution") }),
  async run(context) {
    const { args } = context;
    try {
      const engine = await resolveEngine();
      noteEngine(engine, context.agent);
      const execution = await getExecution(engine, args.executionId);
      return context.ok(execution, {
        cta: {
          commands: [
            {
              command: "executions steps",
              description: "List the steps this execution ran",
              args: { executionId: execution.id },
            },
            {
              command: "executions logs",
              description: "Read the logs this execution wrote",
              args: { executionId: execution.id },
            },
          ],
        },
      });
    } catch (error) {
      return context.error(requestFailure(error, "EXECUTION_GET_FAILED", true));
    }
  },
});

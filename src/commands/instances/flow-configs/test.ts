import { setTimeout as sleep } from "node:timers/promises";
import { z, Cli } from "incur";
import { commandSignal } from "../../../command.js";
import { ListInstanceTestLogsDocument as LIST_INSTANCE_TEST_LOGS } from "../../../graphql/operations/listInstanceTestLogs.generated.js";
import { TestInstanceFlowConfigDocument as TEST_INSTANCE_FLOW_CONFIG } from "../../../graphql/operations/testInstanceFlowConfig.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { type ExecutionEvent, executionEventSchema } from "../../../utils/execution-output.js";
import { tableFlags } from "../../../utils/table.js";

export default Cli.command({
  output: executionEventSchema,
  description: "Test a Flow Config of an Instance",
  args: z.object({ flowConfig: z.string().describe("ID of a Flow Config to test") }),
  options: z.object({
    ...tableFlags({ only: ["extended", "columns"] }),
    tail: z.boolean().optional().describe("Tail logs of the flow config test run"),
    payload: z
      .string()
      .optional()
      .describe("Optional JSON-formatted data payload to submit with the test"),
    contentType: z.string().optional().describe("Optional content-type for the test payload"),
  }),
  async *run(context): AsyncGenerator<ExecutionEvent> {
    const { flowConfig } = context.args;
    const { tail, payload, contentType, columns } = context.options;
    const signal = commandSignal();
    signal?.throwIfAborted();
    const result = await gqlRequest({
      document: TEST_INSTANCE_FLOW_CONFIG,
      variables: { id: flowConfig, payload, contentType },
    });
    const executionId = result.testInstanceFlowConfig?.testInstanceFlowConfigResult?.execution?.id;
    if (!executionId) throw new Error("Flow config test did not create an execution");
    yield { type: "execution", executionId, flowConfigId: flowConfig };
    if (tail) {
      let nextCursor: string | undefined;
      while (true) {
        await sleep(500, undefined, { signal });
        const batch = await fetchInstanceLogs(executionId, nextCursor);
        if (!batch) continue;
        nextCursor = batch.cursor;
        for (const log of batch.logs) {
          const selected = columns?.split(",").map((name) => name.trim().toLowerCase());
          const data = selected
            ? Object.fromEntries(
                Object.entries(log).filter(([key]) => selected.includes(key.toLowerCase())),
              )
            : log;
          yield { type: "log", executionId, data };
        }
        if (batch.executionComplete) break;
      }
    }
    yield { type: "completed", executionId, status: tail ? "completed" : "submitted" };
  },
  alias: { contentType: "c", payload: "p", tail: "t" },
});

export async function fetchInstanceLogs(executionId: string, nextCursor?: string) {
  const result = await gqlRequest({
    document: LIST_INSTANCE_TEST_LOGS,
    variables: { executionId, nextCursor },
  });
  const edges = result.logs.edges;
  if (!edges.length) return undefined;
  const logs = edges.flatMap((edge) => (edge.node ? [edge.node] : []));
  return {
    logs,
    cursor: edges.at(-1)?.cursor,
    executionComplete: logs.some(({ message }) => message.startsWith("Ending Instance Execution")),
  };
}

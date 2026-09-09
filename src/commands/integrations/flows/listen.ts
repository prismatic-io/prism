import { setTimeout as sleep } from "node:timers/promises";
import { decode } from "@msgpack/msgpack";
import { Errors, z, Cli } from "incur";
import inquirer from "inquirer";
import { commandSignal } from "../../../command.js";
import { exists, fs } from "../../../fs.js";
import { GetExecutionsDocument as GET_EXECUTIONS } from "../../../graphql/executions/getExecutions.generated.js";
import { GetPolledExecutionDocument as GET_POLLED_EXECUTION } from "../../../graphql/executions/getPolledExecution.generated.js";
import { UpdateIntegrationFlowListeningModeDocument as UPDATE_INTEGRATION_FLOW_LISTENING_MODE } from "../../../graphql/integrations/updateIntegrationFlowListeningMode.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { handleError } from "../../../utils/errors.js";
import { type ExecutionEvent, executionEventSchema } from "../../../utils/execution-output.js";
import { fetch } from "../../../utils/http.js";
import { type IntegrationFlow, resolveFlow } from "../../../utils/integration/flows.js";
import { runIntegrationFlow } from "../../../utils/integration/invoke.js";
import { getAdaptivePollIntervalMs } from "../../../utils/polling.js";

const DEFAULT_TIMEOUT_SECONDS = 1200;
const DEFAULT_OUTPUT_DIR = "./payloads";
type TriggerType = "WEBHOOK" | "POLLING";
export const listenFlagsSchema = z
  .object({
    "integration-id": z
      .string()
      .min(1)
      .describe("ID of the integration containing the flow to listen to."),
    "flow-id": z
      .string()
      .min(1)
      .optional()
      .describe("ID of the flow to listen to. If not provided, you will be prompted to select."),
    "flow-name": z.string().min(1).optional().describe("Name of the flow to listen to."),
    output: z
      .string()
      .default(DEFAULT_OUTPUT_DIR)
      .describe(`Output directory for the payload file. Defaults to ${DEFAULT_OUTPUT_DIR}`),
    timeout: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_TIMEOUT_SECONDS)
      .describe("Timeout in seconds to stop listening."),
    prompt: z
      .boolean()
      .optional()
      .describe("Prompt before polling (use --no-prompt to poll automatically).")
      .meta({ cli: { legacyName: "no-prompt" } }),
    reset: z
      .boolean()
      .optional()
      .describe("Manually turn off listening mode for a given integration."),
  })
  .refine((options) => options["flow-id"] === undefined || options["flow-name"] === undefined, {
    message: "--flow-id cannot also be provided when using --flow-name",
  });

export type ListenFlags = z.infer<typeof listenFlagsSchema>;

export default Cli.command({
  output: executionEventSchema,
  description: "Listen for webhook executions on a flow and save the payload to a file",
  options: listenFlagsSchema,
  async *run(context): AsyncGenerator<ExecutionEvent> {
    const {
      "integration-id": integrationId,
      "flow-id": flowIdFlag,
      "flow-name": flowNameFlag,
      output,
      timeout,
      prompt,
      reset,
    } = context.options;
    const signal = commandSignal();
    if (reset) {
      await setListeningMode(integrationId, false);
      yield { type: "listening", integrationId, listening: false };
      yield { type: "completed", integrationId, status: "listening-disabled" };
      return;
    }
    const flow = await resolveFlow({
      integrationId,
      flowId: flowIdFlag,
      flowName: flowNameFlag,
      promptMessage: "Select the flow to listen to:",
    });
    const flowId = flow.id;
    const triggerType = getTriggerType(flow.trigger);
    if (triggerType === "POLLING" && prompt !== false) {
      if (context.agent)
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          exitCode: 2,
          message: "Agent mode requires --no-prompt for polling flows",
        });
      const { confirm } = await inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message: "Initiate poll?",
      });
      if (!confirm) {
        yield { type: "completed", integrationId, flowId, status: "listening-disabled" };
        return;
      }
    }
    const startTime = Date.now();
    const listenStartDate = new Date(startTime).toISOString();
    let executionId: string | undefined;
    let savedPath: string | undefined;
    let timedOut = false;
    try {
      signal?.throwIfAborted();
      await setListeningMode(integrationId, true);
      yield { type: "listening", integrationId, listening: true };
      if (triggerType === "POLLING") {
        executionId = (await runIntegrationFlow({ integrationId, flowId })).executionId;
        yield { type: "execution", executionId, integrationId, flowId };
      }
      while (true) {
        if (hasTimedOut(startTime, timeout)) {
          timedOut = true;
          break;
        }
        await sleep(getAdaptivePollIntervalMs(startTime), undefined, { signal });
        if (hasTimedOut(startTime, timeout)) {
          timedOut = true;
          break;
        }
        let url: string | undefined;
        if (triggerType === "POLLING") {
          const requiredValue1 = executionId;
          if (requiredValue1 == null) throw new Error("Polling execution was not created");
          const result = await gqlRequest({
            document: GET_POLLED_EXECUTION,
            variables: {
              executionId: requiredValue1,
            },
          });
          if (!result.executionResult?.endedAt) continue;
          url = result.executionResult.stepResults.nodes[0]?.resultsUrl;
          if (!url) {
            yield {
              type: "warning",
              message: "Execution completed without a downloadable poll payload.",
            };
            break;
          }
        } else {
          const result = await gqlRequest({
            document: GET_EXECUTIONS,
            variables: {
              limit: 1,
              isTestExecution: true,
              startDate: listenStartDate,
              flowId,
            },
          });
          const execution = result.executionResults.nodes[0];
          if (!execution) continue;
          if (executionId !== execution.id) {
            executionId = execution.id;
            yield { type: "execution", executionId, integrationId, flowId };
          }
          if (!execution.endedAt) continue;
          url = execution.requestPayloadUrl;
        }
        savedPath = await downloadAndSavePayload(
          url,
          output,
          flowId,
          {
            filePrefix: triggerType === "POLLING" ? "poll-payload" : "payload",
            useMsgpack: triggerType === "POLLING",
            triggerType,
          },
          signal,
        );
        if (savedPath && executionId)
          yield { type: "payload", executionId, flowId, path: savedPath };
        break;
      }
    } finally {
      // Await remote cleanup on normal completion, error, and iterator.return().
      await setListeningMode(integrationId, false);
    }
    yield { type: "listening", integrationId, listening: false };
    yield {
      type: "completed",
      status: timedOut ? "timed-out" : "completed",
      integrationId,
      flowId,
      ...(executionId ? { executionId } : {}),
      ...(savedPath ? { path: savedPath } : {}),
    };
  },
  alias: {
    reset: "r",
    timeout: "t",
    output: "o",
    "flow-name": "n",
    "flow-id": "f",
    "integration-id": "i",
  },
});

async function setListeningMode(integrationId: string, isListening: boolean): Promise<void> {
  await gqlRequest({
    document: UPDATE_INTEGRATION_FLOW_LISTENING_MODE,
    variables: { integrationId, isListening },
  });
}

async function downloadAndSavePayload(
  url: string,
  outputDir: string,
  flowId: string,
  options: { filePrefix: string; useMsgpack: boolean; triggerType: TriggerType },
  signal?: AbortSignal,
): Promise<string | undefined> {
  try {
    if (!(await exists(outputDir))) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    const response = await fetch(url, { signal });
    const arrayBuffer = await response.arrayBuffer();
    const resultsBuffer = Buffer.from(arrayBuffer);

    let decoded: Record<string, unknown>;
    let payload: unknown;

    if (options.useMsgpack) {
      decoded = decode(resultsBuffer) as Record<string, unknown>;
      const data = (decoded.data ?? decoded) as Record<string, unknown>;
      const body = data.body as Record<string, unknown> | undefined;
      payload = body?.data ?? data;
    } else {
      const text = resultsBuffer.toString("utf-8");
      try {
        decoded = JSON.parse(text);
      } catch {
        decoded = { body: text };
      }

      // Decode base64-encoded body field if present
      payload = decoded.body;
      if (typeof payload === "string") {
        try {
          const decodedBody = Buffer.from(payload, "base64").toString("utf-8");
          try {
            payload = JSON.parse(decodedBody);
          } catch {
            payload = decodedBody;
          }
        } catch {
          // Keep original if base64 decode fails
        }
      }
    }

    const replayPayload = {
      flowId,
      triggerType: options.triggerType,
      payload,
      contentType: decoded.contentType || "application/json",
      headers: decoded.headers || "{}",
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${outputDir}/${options.filePrefix}-${flowId}-${timestamp}.json`;
    await fs.writeFile(fileName, JSON.stringify(replayPayload, null, 2));

    return fileName;
  } catch (err) {
    handleError({
      message: "There was an error downloading or saving the payload.",
      err,
    });
  }
}

function hasTimedOut(startTime: number, timeout: number): boolean {
  return Date.now() - startTime > timeout * 1000;
}

export function getTriggerType(trigger: IntegrationFlow["trigger"]): TriggerType {
  const { action } = trigger;

  // Reject scheduled flows - they run on a schedule, not via webhook or polling
  if (action.scheduleSupport === "REQUIRED" && action.component?.key === "schedule-triggers") {
    throw new Error(
      "Cannot listen to scheduled flows. This flow uses a schedule trigger and runs automatically on a schedule, not in response to webhooks or manual polling.",
    );
  }

  const isPolling =
    action.isPollingTrigger ||
    (action.scheduleSupport === "REQUIRED" && action.component?.key !== "schedule-triggers");
  return isPolling ? "POLLING" : "WEBHOOK";
}

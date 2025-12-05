import { Flags, ux } from "@oclif/core";
import { decode } from "@msgpack/msgpack";
import inquirer from "inquirer";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { fetch } from "../../../utils/http.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { exists, fs } from "../../../fs.js";
import { handleError } from "../../../utils/errors.js";
import {
  getIntegrationFlows,
  type IntegrationFlow,
  selectFlowPrompt,
} from "../../../utils/integration/flows.js";
import { runIntegrationFlow } from "../../../utils/integration/invoke.js";
import { getAdaptivePollIntervalMs } from "../../../utils/polling.js";

const DEFAULT_TIMEOUT_SECONDS = 1200; // 20 minutes
const DEFAULT_OUTPUT_DIR = "./payloads";

type PolledExecutionResult = {
  executionResult: {
    id: string;
    endedAt: string | null;
    stepResults: {
      nodes: Array<{
        id: string;
        stepName: string;
        resultsUrl: string;
      }>;
    };
  };
};

type ExecutionResult = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  requestPayloadUrl: string;
  responsePayloadUrl: string;
};

type TriggerType = "WEBHOOK" | "POLLING";

export default class ListenCommand extends PrismaticBaseCommand {
  private startTime = 0;
  static description = "Listen for webhook executions on a flow and save the payload to a file";

  static flags = {
    "integration-id": Flags.string({
      char: "i",
      description: "ID of the integration containing the flow to listen to.",
      required: true,
    }),
    "flow-id": Flags.string({
      char: "f",
      description: "ID of the flow to listen to. If not provided, you will be prompted to select.",
    }),
    output: Flags.string({
      char: "o",
      description: `Output directory for the payload file. Defaults to ${DEFAULT_OUTPUT_DIR}`,
      default: DEFAULT_OUTPUT_DIR,
    }),
    timeout: Flags.integer({
      char: "t",
      description: "Timeout in seconds to stop listening.",
      default: DEFAULT_TIMEOUT_SECONDS,
    }),
    "no-prompt": Flags.boolean({
      char: "n",
      description:
        "For flows using polling triggers, automatically poll without a confirmation prompt.",
    }),
    reset: Flags.boolean({
      char: "r",
      description: "Manually turn off listening mode for a given integration.",
    }),
  };

  async run() {
    const {
      flags: {
        "integration-id": integrationId,
        "flow-id": flowIdFlag,
        output,
        timeout,
        quiet,
        "no-prompt": noPrompt,
        reset,
      },
    } = await this.parse(ListenCommand);

    if (reset) {
      return await safeSetListeningMode(integrationId, false, true);
    }

    let flowId = flowIdFlag;
    let selectedFlow: IntegrationFlow | undefined;

    if (!flowId) {
      selectedFlow = await selectFlowPrompt(integrationId, {
        message: "Select the flow to listen to:",
      });
      flowId = selectedFlow.id;
    } else {
      const flows = await getIntegrationFlows(integrationId);
      selectedFlow = flows.find((flow) => flow.id === flowId);
    }

    if (!selectedFlow) {
      throw `There was an error locating a flow with the ID ${flowId}. Please verify that the given flowId is correct, or re-run without a flowId and just use an integrationId.`;
    }

    const triggerType = getTriggerType(selectedFlow.trigger);

    await safeSetListeningMode(integrationId, true);
    this.startTime = Date.now();

    this.quietLog(
      `To enable listening for this flow directly, you can run:\nprism integrations:flows:listen -i ${integrationId} -f ${flowId}\n`,
      quiet,
    );

    if (triggerType === "WEBHOOK") {
      this.quietLog("\nListening for webhook executions. Press CMD+C/CTRL+C to stop.\n", quiet);
      this.quietLog(`This process will timeout after ${timeout / 60} minutes.\n`, quiet);

      await withCleanup(integrationId, async () => {
        const execution = await pollForWebhookExecutions(flowId, this.startTime, timeout);

        if (execution) {
          ux.action.start("Downloading payload...");
          const filepath = await downloadAndSavePayload(
            execution.requestPayloadUrl,
            output,
            flowId,
            {
              filePrefix: "payload",
              useMsgpack: false,
              triggerType,
            },
          );
          this.quietLog(
            `\nTo replay this payload, you can run:\nprism integrations:flows:test -i ${integrationId} -f ${flowId} -p ${filepath}\n`,
            quiet,
          );
          ux.action.stop();
        }
      });
    } else if (triggerType === "POLLING") {
      this.quietLog("\nListening for poll executions. Press CMD+C/CTRL+C to stop.\n", quiet);

      if (!noPrompt) {
        this.quietLog(
          "When you are ready to initiate a test poll for your flow, please confirm below.\n",
          quiet,
        );

        const result = await inquirer.prompt({
          type: "confirm",
          name: "confirm",
          message: "Initiate poll?",
        });

        if (!result.confirm) {
          await safeSetListeningMode(integrationId, false, false);
          return;
        }

        this.quietLog(`This process will timeout after ${timeout / 60} minutes.\n`, quiet);
      }

      await withCleanup(integrationId, async () => {
        let executionId: string;
        try {
          const result = await runIntegrationFlow({ integrationId, flowId });
          executionId = result.executionId;
        } catch (err) {
          handleError({
            message: "Failed to initiate poll test run.",
            err,
            throwError: true,
          });
          throw err;
        }

        while (true) {
          if (hasTimedOut(this.startTime, timeout)) {
            this.warn("Timeout reached. Stopping listener.");
            return;
          }

          await ux.wait(getAdaptivePollIntervalMs(this.startTime));

          let result: PolledExecutionResult;
          try {
            result = await getPolledExecution(executionId);
          } catch (err) {
            handleError({
              message: "Failed to fetch poll execution status.",
              err,
              throwError: true,
            });
            throw err;
          }

          // Having an endedAt means the execution completed.
          if (result.executionResult.endedAt) {
            const stepResult = result.executionResult.stepResults.nodes[0];
            if (stepResult?.resultsUrl) {
              ux.action.start("Downloading poll payload...");
              const filepath = await downloadAndSavePayload(stepResult.resultsUrl, output, flowId, {
                filePrefix: "poll-payload",
                useMsgpack: true,
                triggerType,
              });
              this.quietLog(
                `\nTo replay this payload, you can run:\nprism integrations:flows:test -i ${integrationId} -f ${flowId} -p ${filepath}\n`,
                quiet,
              );
              ux.action.stop();
            }
            return;
          }
        }
      });
    }
  }
}

async function safeSetListeningMode(
  integrationId: string,
  isListening: boolean,
  exitProcess = false,
): Promise<void> {
  try {
    await setListeningMode(integrationId, isListening);
  } catch (err) {
    console.warn(
      `Failed to ${isListening ? "enable" : "disable"} listening mode: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  } finally {
    if (exitProcess) {
      process.exit(0);
    }
  }
}

// Execute a function with cleanup handling for SIGINT and listening mode
async function withCleanup(integrationId: string, fn: () => Promise<void>): Promise<void> {
  const cleanup = async () => {
    console.log("\nStopping listener...");
    await safeSetListeningMode(integrationId, false, true);
  };
  process.on("SIGINT", cleanup);

  try {
    await fn();
  } finally {
    await safeSetListeningMode(integrationId, false, false);
    process.removeListener("SIGINT", cleanup);
  }
}

async function setListeningMode(integrationId: string, isListening: boolean): Promise<void> {
  await gqlRequest({
    document: gql`
        mutation updateIntegrationFlowListeningMode($integrationId: ID!, $isListening: Boolean) {
          updateWorkflowTestConfiguration(
            input: {id: $integrationId, listeningMode: $isListening}
          ) {
            errors {
              field
              messages
            }
          }
        }
      `,
    variables: { integrationId, isListening },
  });
  console.log(`Set listening mode to ${isListening} for integration ${integrationId}`);
}

async function pollForWebhookExecutions(
  flowId: string,
  startTime: number,
  timeout: number,
): Promise<ExecutionResult | null> {
  const listenStartDate = new Date().toISOString();

  while (true) {
    await ux.wait(getAdaptivePollIntervalMs(startTime));

    const result = await gqlRequest({
      document: gql`
          query getExecutions($flowId: ID, $isTestExecution: Boolean, $limit: Int, $startDate: DateTime) {
            executionResults(
              first: $limit
              isTestExecution: $isTestExecution
              startedAt_Gte: $startDate
              flowConfig_Flow: $flowId
            ) {
              nodes {
                id
                endedAt
                requestPayloadUrl
                responsePayloadUrl
              }
            }
          }
        `,
      variables: {
        limit: 1,
        isTestExecution: true,
        startDate: listenStartDate,
        flowId,
      },
    });

    if (hasTimedOut(startTime, timeout)) {
      console.warn("Timeout reached. Stopping listener.");
      return null;
    }

    if (result.executionResults.nodes.length > 0) {
      const execution = result.executionResults.nodes[0];

      if (!execution.endedAt) {
        console.log(`\nExecution ${execution.id} started, waiting for completion...`);
        continue;
      }

      console.log("\nExecution complete.");
      return execution;
    }
  }
}

async function downloadAndSavePayload(
  url: string,
  outputDir: string,
  flowId: string,
  options: { filePrefix: string; useMsgpack: boolean; triggerType: TriggerType },
): Promise<string | undefined> {
  try {
    if (!(await exists(outputDir))) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    const response = await fetch(url);
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

    console.log(`\nPayload saved to: ${fileName}`);
    return fileName;
  } catch (err) {
    handleError({
      message: "There was an error downloading or saving the payload.",
      err,
      throwError: true,
    });
  }
}

function hasTimedOut(startTime: number, timeout: number): boolean {
  return Date.now() - startTime > timeout * 1000;
}

async function getPolledExecution(executionId: string): Promise<PolledExecutionResult> {
  return gqlRequest({
    document: gql`
      query getPolledExecution($executionId: ID!) {
        executionResult(id: $executionId) {
          id
          endedAt
          stepResults(orderBy: { direction: ASC, field: STARTED_AT }, first: 1) {
            nodes {
              id
              stepName
              resultsUrl
            }
          }
        }
      }
    `,
    variables: {
      executionId,
    },
  });
}

export function getTriggerType(trigger: IntegrationFlow["trigger"]): TriggerType {
  const { action } = trigger;

  // Reject scheduled flows - they run on a schedule, not via webhook or polling
  if (action.scheduleSupport === "REQUIRED" && action.component.key === "schedule-triggers") {
    throw new Error(
      "Cannot listen to scheduled flows. This flow uses a schedule trigger and runs automatically on a schedule, not in response to webhooks or manual polling.",
    );
  }

  const isPolling =
    action.isPollingTrigger ||
    (action.scheduleSupport === "REQUIRED" && action.component.key !== "schedule-triggers");
  return isPolling ? "POLLING" : "WEBHOOK";
}

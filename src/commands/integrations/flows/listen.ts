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
      },
    } = await this.parse(ListenCommand);

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

    const triggerType = this.getTriggerType(selectedFlow.trigger);

    await this.setListeningMode(integrationId, true);
    this.startTime = Date.now();

    if (triggerType === "WEBHOOK") {
      this.quietLog("\nListening for webhook executions. Press CMD+C/CTRL+C to stop.\n", quiet);
      this.quietLog(`This process will timeout after ${timeout} seconds.\n`, quiet);
      this.quietLog(
        `To enable listening for this flow directly, you can run:\nprism integrations:flows:listen -i ${integrationId} -f ${flowId}\n`,
        quiet,
      );

      await this.withCleanup(integrationId, async () => {
        const execution = await this.pollForWebhookExecutions(flowId, timeout);

        if (execution) {
          ux.action.start("Downloading payload...");
          await this.downloadAndSavePayload(execution.requestPayloadUrl, output, flowId, {
            filePrefix: "payload",
            useMsgpack: false,
          });
          ux.action.stop();
        }
      });
    } else if (triggerType === "POLLING") {
      this.quietLog("\nListening for poll executions. Press CMD+C/CTRL+C to stop.\n", quiet);
      this.quietLog(
        `To enable listening for this flow directly, you can run:\nprism integrations:flows:listen -i ${integrationId} -f ${flowId}\n`,
        quiet,
      );

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
          await this.safeSetListeningMode(integrationId, false, false);
          return;
        }

        this.quietLog(`This process will timeout after ${timeout} seconds.\n`, quiet);
      }

      await this.withCleanup(integrationId, async () => {
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
          if (this.hasTimedOut(timeout)) {
            this.warn("Timeout reached. Stopping listener.");
            return;
          }

          await ux.wait(getAdaptivePollIntervalMs(this.startTime));

          let result: PolledExecutionResult;
          try {
            result = await this.getPolledExecution(executionId);
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
              await this.downloadAndSavePayload(stepResult.resultsUrl, output, flowId, {
                filePrefix: "poll-payload",
                useMsgpack: true,
              });
              ux.action.stop();
            }
            return;
          }
        }
      });
    }
  }

  // Safely set listening mode with error handling
  private async safeSetListeningMode(
    integrationId: string,
    isListening: boolean,
    exitProcess = false,
  ): Promise<void> {
    try {
      await this.setListeningMode(integrationId, isListening);
    } catch (err) {
      this.warn(
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
  private async withCleanup(integrationId: string, fn: () => Promise<void>): Promise<void> {
    const cleanup = async () => {
      this.log("\nStopping listener...");
      await this.safeSetListeningMode(integrationId, false, true);
    };
    process.on("SIGINT", cleanup);

    try {
      await fn();
    } finally {
      await this.safeSetListeningMode(integrationId, false, false);
      process.removeListener("SIGINT", cleanup);
    }
  }

  private async setListeningMode(integrationId: string, isListening: boolean): Promise<void> {
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
    this.log(`Set listening mode to ${isListening} for integration ${integrationId}`);
  }

  private async pollForWebhookExecutions(
    flowId: string,
    timeout: number,
  ): Promise<ExecutionResult | null> {
    const listenStartDate = new Date().toISOString();

    while (true) {
      await ux.wait(getAdaptivePollIntervalMs(this.startTime));

      const result = await gqlRequest({
        document: gql`
          query getExecutions($flowId: ID, $isTestExecution: Boolean, $limit: Int, $startDate: DateTime) {
            executionResults(
              first: $limit
              isTestExecution: $isTestExecution
              startedAt_Gte: $startDate
            ) {
              nodes {
                id
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

      if (this.hasTimedOut(timeout)) {
        this.warn("Timeout reached. Stopping listener.");
        return null;
      }

      if (result.executionResults.nodes.length > 0) {
        const execution = result.executionResults.nodes[0];

        if (!execution.endedAt) {
          this.log(`\nExecution ${execution.id} started, waiting for completion...`);
          continue;
        }

        this.log("\nExecution complete.");
        return execution;
      }
    }
  }

  private async downloadAndSavePayload(
    url: string,
    outputDir: string,
    flowId: string,
    options: { filePrefix: string; useMsgpack: boolean },
  ): Promise<void> {
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
        payload,
        contentType: decoded.contentType || "application/json",
        headers: decoded.headers || "{}",
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${outputDir}/${options.filePrefix}-${flowId}-${timestamp}.json`;
      await fs.writeFile(fileName, JSON.stringify(replayPayload, null, 2));

      this.log(`\nPayload saved to: ${fileName}`);
    } catch (err) {
      handleError({
        message: "There was an error downloading or saving the payload.",
        err,
        throwError: true,
      });
    }
  }

  private hasTimedOut(timeout: number): boolean {
    return Date.now() - this.startTime > timeout * 1000;
  }

  private getTriggerType(trigger: IntegrationFlow["trigger"]): TriggerType {
    const { action } = trigger;
    const isPolling =
      action.isPollingTrigger ||
      (action.scheduleSupport === "REQUIRED" && action.component.key !== "schedule-triggers");
    return isPolling ? "POLLING" : "WEBHOOK";
  }

  private async getPolledExecution(executionId: string): Promise<PolledExecutionResult> {
    return gqlRequest({
      document: gql`
      query getPolledExecution($executionId: ID!, $stepName: String) {
        executionResult(id: $executionId) {
          id
          endedAt
          stepResults(stepName: $stepName) {
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
        stepName: "trigger",
      },
    });
  }
}

import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { fetch } from "../../../utils/http.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { exists, fs } from "../../../fs.js";
import { handleError } from "../../../utils/errors.js";
import { selectFlowPrompt } from "../../../utils/integration/flows.js";
import { getAdaptivePollIntervalMs } from "../../../utils/polling.js";

const DEFAULT_TIMEOUT_SECONDS = 1200; // 20 minutes
const DEFAULT_OUTPUT_DIR = "./payloads";

type ExecutionResult = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  requestPayloadUrl: string;
  responsePayloadUrl: string;
};

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
  };

  async run() {
    const {
      flags: { "integration-id": integrationId, "flow-id": flowIdFlag, output, timeout, quiet },
    } = await this.parse(ListenCommand);

    let flowId = flowIdFlag;
    if (!flowId) {
      const selectedFlow = await selectFlowPrompt(integrationId, {
        message: "Select the flow to listen to:",
      });
      flowId = selectedFlow.id;
    }

    await this.setListeningMode(integrationId, true);

    this.startTime = Date.now();

    this.quietLog("\nListening for webhook executions. Press CMD+C/CTRL+C to stop.\n", quiet);
    this.quietLog(`This process will timeout after ${timeout / 60} minutes.\n`, quiet);
    this.quietLog(
      `To enable listening for this flow directly, you can run:\nprism integrations:flows:listen -i ${integrationId} -f ${flowId}\n`,
      quiet,
    );

    // Shared helper to safely set listening mode without throwing
    const safeSetListeningMode = async (isListening: boolean, exitProcess = false) => {
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
    };

    // Set up cleanup handler for SIGINT
    const cleanup = async () => {
      this.log("\nStopping listener...");
      await safeSetListeningMode(false, true);
    };
    process.on("SIGINT", cleanup);

    try {
      const execution = await this.pollForWebhookExecutions(flowId, timeout);

      if (execution) {
        ux.action.start("Downloading payload...");
        await this.downloadAndSavePayload(execution, output, flowId);
        ux.action.stop();
      }
    } finally {
      await safeSetListeningMode(false, false);
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

  /**
   * Download payload file and save as JSON suitable for replay.
   *   - Webhook payloads may be base64 encoded.
   */
  private async downloadAndSavePayload(
    execution: ExecutionResult,
    outputDir: string,
    flowId: string,
  ): Promise<void> {
    try {
      if (!(await exists(outputDir))) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      const response = await fetch(execution.requestPayloadUrl);
      const arrayBuffer = await response.arrayBuffer();
      const resultsBuffer = Buffer.from(arrayBuffer);

      let decoded: Record<string, unknown>;

      const text = resultsBuffer.toString("utf-8");
      try {
        decoded = JSON.parse(text);
      } catch {
        // If not valid JSON, save as raw text
        decoded = { body: text };
      }

      // Decode base64-encoded body field if present
      let payload: unknown = decoded.body;
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

      const replayPayload = {
        flowId,
        payload,
        contentType: decoded.contentType || "application/json",
        headers: decoded.headers || "{}",
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${outputDir}/payload-${flowId}-${timestamp}.json`;
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
}

import { Flags, ux } from "@oclif/core";
import { decode } from "@msgpack/msgpack";
import open from "open";
import { prismaticUrl } from "../../../auth.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { fetch } from "../../../utils/http.js";
import {
  isCniExecutionComplete,
  FetchLogsResult,
  getExecutionLogs,
  getExecutionStepResults,
  LogNode,
  StepResultNode,
  selectFlowPrompt,
} from "../../../utils/integration/flows.js";
import { exists, fs } from "../../../fs.js";
import { getPrismMetadata } from "../../../utils/integration/metadata.js";
import { handleError } from "../../../utils/errors.js";
import {
  getIntegrationSystemId,
  isIntegrationConfigured,
} from "../../../utils/integration/query.js";
import { getAdaptivePollIntervalMs } from "../../../utils/polling.js";

type FormattedStepResult = {
  stepName: string;
  endedAt: string;
  result: Record<string, unknown>;
};

const MISSING_ID_ERROR = "You must provide either a flow-url or an integration-id parameter.";
const TIMEOUT_SECONDS = 60 * 20; // 20 minutes

export const CONFIGURE_INSTANCE_PARAMS = {
  embed: "true",
  theme: "LIGHT",
  reconfigure: "true",
  screenConfiguration: JSON.stringify({
    configurationWizard: {
      mode: "streamlined",
    },
  }),
};

export default class TestFlowCommand extends PrismaticBaseCommand {
  private startTime = 0;

  static description = "Run a test execution of a flow";
  static flags = {
    "flow-url": Flags.string({
      char: "u",
      description: "Invocation URL of the flow to run.",
    }),
    "integration-id": Flags.string({
      char: "i",
      description: "ID of the integration containing the flow to test.",
    }),
    payload: Flags.string({
      char: "p",
      description: "Optional file containing a payload to run the flow with.",
    }),
    "payload-content-type": Flags.string({
      char: "c",
      description: "Optional Content-Type for the test payload.",
      default: "application/json",
    }),
    sync: Flags.boolean({
      description: "Forces the flow to run synchronously.",
    }),
    "tail-results": Flags.boolean({
      description: "Tail step results from the test execution until user interrupt or timeout.",
    }),
    "tail-logs": Flags.boolean({
      description: "Tail logs from the test execution until user interrupt or timeout.",
    }),
    "cni-auto-end": Flags.boolean({
      description:
        "Automatically stop polling activity once an CNI flow execution completes. Some logs & results may not be returned this way. DOES NOT WORK FOR LOW-CODE FLOWS.",
    }),
    timeout: Flags.integer({
      description:
        "Optionally set a timeout (in seconds) to stop tail activity. Compatible with both low-code and CNI flows.",
    }),
    "result-file": Flags.string({
      char: "r",
      description:
        "Optional file to append tailed execution result data to. Results are saved into JSON Lines.",
    }),
    jsonl: Flags.boolean({
      description: "Optionally format the step and tail results output into JSON Lines.",
    }),
    debug: Flags.boolean({
      description: "Enables debug mode on the test execution.",
    }),
    apiKey: Flags.string({
      description: "Optional API key for flows with secured endpoints.",
    }),
  };

  async run() {
    const {
      flags: {
        sync,
        "flow-url": flowUrl,
        "integration-id": integrationIdFlag,
        payload: payloadFilePath,
        "payload-content-type": contentType,
        "tail-logs": tailLogs,
        "tail-results": tailStepResults,
        "cni-auto-end": autoEndPoll,
        "result-file": resultFilePath,
        timeout,
        debug,
        quiet,
        apiKey,
      },
    } = await this.parse(TestFlowCommand);

    // Load custom trigger payload if provided.
    let triggerPayload = "";
    if (payloadFilePath) {
      if (await exists(payloadFilePath)) {
        triggerPayload = await fs.readFile(payloadFilePath, { encoding: "utf-8" });

        // Validate JSON files specifically. CSV and XML files fail more gracefully if malformed
        if (contentType === "application/json") {
          try {
            JSON.parse(triggerPayload);
          } catch (e) {
            handleError({
              message:
                "The provided trigger payload file contains malformed JSON. Please check the payload file (-p) and Content-Type (-c).",
              err: e,
              throwError: true,
            });
          }
        }
      } else {
        handleError({
          message: `No file found at ${payloadFilePath}. Please check the --trigger-payload-file (-p) parameter.`,
          throwError: true,
        });
      }
    }

    let integrationId = integrationIdFlag;
    let invokeUrl = flowUrl ?? "";

    // Try to find an integrationId if we were not provided with an ID or
    // direct invocation URL.
    if (!invokeUrl && !integrationId) {
      try {
        const metadata = await getPrismMetadata();
        integrationId = metadata.integrationId;

        if (!integrationId) {
          throw new Error();
        }
      } catch (err) {
        handleError({ message: MISSING_ID_ERROR, throwError: true });
      }
    }

    // Check if the integration is fully configured. We cannot do this check for invokes
    // via URL that have no integrationId in the metadata.
    if (integrationId) {
      const isConfigured = await isIntegrationConfigured(integrationId);
      const systemInstanceId = await getIntegrationSystemId(integrationId);

      if (!isConfigured) {
        this.warn("The integration needs to be configured before it can be tested.");
      }

      const url = new URL(`${prismaticUrl}/configure-instance/${systemInstanceId}`);
      for (const [key, value] of Object.entries(CONFIGURE_INSTANCE_PARAMS)) {
        url.searchParams.set(key, value);
      }

      const configUrl = url.toString();

      if (!isConfigured) {
        if (quiet) {
          this.warn(`Configure the test instance by visiting the following URL:\n${configUrl}`);
        } else {
          const shouldOpen = await ux.confirm(
            "Would you like to open the Configuration Wizard in your browser? (yes/no)",
          );

          if (shouldOpen) {
            await open(configUrl);
          } else {
            this.log(
              `\nYou can configure the test instance later by visiting the following URL:\n${configUrl}`,
            );
          }
          return;
        }
      }
    }

    // Once we have an integrationId, prompt the user to select a flow.
    // If an invocation URL was provided, this gets skipped.
    if (integrationId) {
      const selectedFlow = await selectFlowPrompt(integrationId, {
        message: "Select the flow to test:",
      });
      invokeUrl = selectedFlow.testUrl;
    }

    if (!invokeUrl) {
      handleError({ message: MISSING_ID_ERROR, throwError: true });
    }

    ux.action.start("Starting execution...");
    // If this POST fails then just let the error be thrown normally.
    const response = await fetch(invokeUrl, {
      method: "POST",
      body: triggerPayload,
      headers: {
        ...(sync ? { "prismatic-synchronous": "true" } : {}),
        ...(debug ? { "prismatic-debug": "true" } : {}),
        ...(contentType && triggerPayload ? { "Content-Type": contentType } : {}),
        ...(apiKey ? { "Api-Key": apiKey } : {}),
      },
    });
    const responseData = (await response.json()) as any;
    ux.action.stop();

    this.startTime = Date.now();

    const flagString = `${payloadFilePath ? `-p=${payloadFilePath} -c=${contentType}` : ""}${
      tailLogs ? "--tail-logs " : ""
    }${tailStepResults ? "--tail-results " : ""}${sync ? "--sync " : ""}${
      autoEndPoll ? "--cni-auto-end " : ""
    }${resultFilePath ? `-r=${resultFilePath} ` : ""}`;

    this.quietLog(
      `
To re-run this flow directly:
prism integrations:flows:test -u=${invokeUrl} ${flagString}
`,
      quiet,
    );

    const executionId = response.headers.get("prismatic-executionid") || "";

    if (!responseData?.executionId) {
      // Log execution ID's separately for synchronously-run flows.
      this.log(`Execution ID: ${executionId}\n`);
    }

    // Log the results.
    this.log(`${JSON.stringify(responseData)}\n`);

    if (!(tailLogs || tailStepResults)) return;

    // If tailing logs or step results, show relevant messaging & setup polling promises.
    this.quietLog(
      "While the timestamps are accurate, logs & step results may not arrive in chronological order.",
      quiet,
      "warn",
    );
    this.quietLog(
      `\nPress CMD+C/CTRL+C to stop polling. ${
        autoEndPoll
          ? ""
          : `This process will timeout after ${timeout ? `${timeout} seconds` : "20 minutes"}.`
      }\n`,
      quiet,
    );

    const tailPromises = [];
    this.startTime = Date.now();

    if (tailLogs) tailPromises.push(this.tailLogs(executionId));
    if (tailStepResults) tailPromises.push(this.tailStepResults(executionId));

    let timeoutTimer: NodeJS.Timeout | undefined = undefined;
    const timeoutPromise = new Promise<void>((resolve) => {
      timeoutTimer = setTimeout(
        () => {
          this.quietLog("Timeout reached. Stopping polling.", quiet);
          process.exit(0);
        },
        (timeout ?? TIMEOUT_SECONDS) * 1000,
      );
    });
    await Promise.race([Promise.all(tailPromises), timeoutPromise]);

    // Clear the timeout to allow process to exit cleanly
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }

  private async tailLogs(executionId: string) {
    const {
      flags: { "cni-auto-end": autoEndPoll, "result-file": resultFilePath, timeout, jsonl },
    } = await this.parse(TestFlowCommand);

    let nextCursor: string | undefined = undefined;

    while (true) {
      await ux.wait(getAdaptivePollIntervalMs(this.startTime));

      const result = await this.fetchLogs(executionId, nextCursor);
      if (result === undefined) continue;

      const { logs, cursor } = result;
      nextCursor = cursor;

      if (jsonl) {
        logs.forEach((result) => {
          this.log(JSON.stringify(result));
        });
      } else {
        ux.table(
          logs,
          {
            timestamp: {},
            severity: {
              get: (row) => `LOG_${row.severity}`,
              minWidth: 15,
            },
            message: {},
          },
          {
            "no-header": true,
          },
        );
      }

      if (resultFilePath) {
        for (const log of logs) {
          await fs.appendFile(resultFilePath, JSON.stringify(log));
        }
      }

      if (await this.shouldEnd(executionId, autoEndPoll, timeout)) {
        return;
      }
    }
  }

  private async tailStepResults(executionId: string) {
    const {
      flags: { "cni-auto-end": autoEndPoll, "result-file": resultFilePath, timeout, jsonl },
    } = await this.parse(TestFlowCommand);

    let nextCursor: string | undefined = undefined;

    while (true) {
      await ux.wait(getAdaptivePollIntervalMs(this.startTime));

      const result = await this.fetchStepResults(executionId, nextCursor);
      if (result === undefined) {
        continue;
      }

      const { stepResults, cursor } = result;
      nextCursor = cursor;

      if (jsonl) {
        stepResults.forEach((result) => {
          this.log(JSON.stringify(result));
        });
      } else {
        ux.table(
          stepResults,
          {
            endedAt: {},
            stepName: {
              get: (row) => `STEP_${row.stepName}`,
              minWidth: 15,
            },
            result: {},
          },
          {
            "no-header": true,
          },
        );
      }

      if (resultFilePath) {
        for (const result of stepResults) {
          await fs.appendFile(resultFilePath, JSON.stringify(stepResults));
        }
      }

      if (await this.shouldEnd(executionId, autoEndPoll, timeout)) {
        return;
      }
    }
  }

  private async fetchLogs(
    executionId: string,
    nextCursor?: string,
  ): Promise<FetchLogsResult | undefined> {
    const results = await getExecutionLogs(executionId, nextCursor);

    const { edges }: { edges: { node: LogNode; cursor?: string }[] } = results.logs;
    if (!edges || edges.length === 0) {
      return undefined;
    }

    const logs = edges.map(({ node }) => node);

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor };
  }

  private async fetchStepResults(executionId: string, nextCursor?: string) {
    const results = await getExecutionStepResults(executionId, nextCursor);

    const { edges }: { edges: { node: StepResultNode; cursor?: string }[] } =
      results.executionResult.stepResults;

    if (!edges || edges.length === 0) {
      return undefined;
    }

    const stepResults: Array<FormattedStepResult> = [];

    for (const edge of edges) {
      const { endedAt, resultsUrl, stepName } = edge.node;

      try {
        const response = await fetch(resultsUrl);
        const arrayBuffer = await response.arrayBuffer();
        const resultsBuffer = Buffer.from(arrayBuffer);
        const result = decode(resultsBuffer) as Record<string, unknown>;

        stepResults.push({
          stepName,
          endedAt,
          result,
        });
      } catch (err) {
        // Allow the process to keep running, just skip rendering the step result.
        handleError({
          message: `There was an error fetching step results for step: ${stepName}`,
          err,
          throwError: false,
        });
      }
    }

    const { cursor } = edges[edges.length - 1];
    return { stepResults, cursor };
  }

  private async shouldEnd(executionId: string, autoEndPoll: boolean, timeout = TIMEOUT_SECONDS) {
    return (
      Date.now() - this.startTime > timeout * 1000 ||
      (autoEndPoll && (await isCniExecutionComplete(executionId)))
    );
  }
}

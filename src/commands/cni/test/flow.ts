import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import inquirer from "inquirer";
import {
  cniExecutionIsComplete,
  FetchLogsResult,
  listExecutionLogs,
  listExecutionStepResults,
  listIntegrationFlows,
  LogNode,
  StepResultNode,
} from "../../../utils/integration/flows.js";
import axios from "axios";
import { getPrismMetadata } from "../../../utils/integration/metadata.js";
import { exists, fs } from "../../../fs.js";
import { decode } from "@msgpack/msgpack";

type FormattedStepResult = {
  type: string;
  endedAt: string;
  result: Record<string, unknown>;
};

const MISSING_ID_ERROR = "You must provide either a flow-url or an integration-id parameter.";
const TIMEOUT_MS = 1000 * 60 * 20; // 20 minutes
export default class CniTestFlowCommand extends PrismaticBaseCommand {
  private startTime = 0;

  static description = "Run a test execution of a CNI flow";
  static flags = {
    "flow-url": Flags.string({
      char: "u",
      description: "Invocation URL of the flow to run.",
    }),
    "integration-id": Flags.string({
      char: "i",
      description: "ID of the integration containing the flow to test.",
    }),
    "trigger-payload-file": Flags.string({
      char: "p",
      description: "A file containing a custom trigger payload to run the flow with.",
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
    "auto-end": Flags.boolean({
      description:
        "Automatically stop polling activity once an execution completes. Some logs & results may not be returned this way.",
    }),
    "result-file": Flags.string({
      char: "r",
      description:
        "A file to append execution result data to. Results are saved as comma-separated values.",
    }),
  };

  async run() {
    const {
      flags: {
        sync,
        "flow-url": flowUrl,
        "integration-id": integrationIdFlag,
        "trigger-payload-file": triggerPayloadFilePath,
        "tail-logs": tailLogs,
        "tail-results": tailStepResults,
        "auto-end": autoEndPoll,
        "result-file": resultFilePath,
      },
    } = await this.parse(CniTestFlowCommand);

    // Load custom trigger payload if provided.
    let triggerPayload: Record<string, string> = {};
    if (triggerPayloadFilePath) {
      if (await exists(triggerPayloadFilePath)) {
        triggerPayload = JSON.parse(
          await fs.readFile(triggerPayloadFilePath, { encoding: "utf-8" }),
        );
      } else {
        throw `No file found at ${triggerPayloadFilePath}. Please double check the --trigger-payload-file (-p) parameter.`;
      }
    }

    let integrationId = integrationIdFlag;
    let invokeUrl = flowUrl ?? "";

    // Try to find an integrationId if we were not provided with an ID or invocation URL.
    if (!invokeUrl && !integrationId) {
      try {
        const metadata = await getPrismMetadata();
        integrationId = metadata.integrationId;
      } catch (e) {
        throw MISSING_ID_ERROR;
      }

      if (!integrationId) throw MISSING_ID_ERROR;
    }

    // Once we have an integrationId, prompt the user to select a flow.
    // If an invocation URL was provided, this gets skipped.
    if (integrationId) {
      try {
        const flows = await listIntegrationFlows(integrationId);
        const { flow } = await inquirer.prompt({
          type: "list",
          name: "flow",
          message: "Select the flow to test:",
          choices: flows.map((flow) => {
            return {
              name: `${flow.name} (${flow.stableKey})`,
              value: {
                invokeUrl: flow.testUrl,
              },
            };
          }),
        });

        invokeUrl = flow.invokeUrl;
      } catch (e) {
        console.error(
          "There was an error looking up flows for your integration. Please provide an integration ID or reimport your integration.",
        );
        throw e;
      }
    }

    // At this point we have an invocation URL.
    ux.action.start("Starting execution...");
    const response = await axios.post(invokeUrl, triggerPayload, {
      headers: {
        ...(sync ? { "prismatic-synchronous": true } : {}),
        "Content-Type": "application/json",
      },
    });
    ux.action.stop();

    this.startTime = Date.now();

    const flagString = `${triggerPayloadFilePath ? `-p=${triggerPayloadFilePath} ` : ""}${
      tailLogs ? "--tail-logs " : ""
    }${tailStepResults ? "--tail-results " : ""}${sync ? "--sync " : ""}${
      autoEndPoll ? "--auto-end " : ""
    }${resultFilePath ? `-r=${resultFilePath} ` : ""}`;

    this.log(`
To re-run this flow directly:
prism cni:test:flow -u=${invokeUrl} ${flagString}
`);

    const executionId = response.headers["prismatic-executionid"];

    if (!response.data.executionId) {
      // Log execution ID's separately for synchronously-run flows.
      this.log(`Execution ID: ${executionId}\n`);
    }

    // Log the results.
    this.log(`${JSON.stringify(response.data)}\n`);

    if (!(tailLogs || tailStepResults)) return;

    // If tailing logs or step results, show relevant messaging & setup polling promises.
    this.warn(
      "While the timestamps are accurate, logs & step results may not arrive in chronological order.",
    );
    this.log(
      `\nPress CMD+C/CTRL+C to stop polling. ${
        autoEndPoll ? "" : "This process will timeout after 20 minutes."
      }\n`,
    );

    if (resultFilePath) {
      fs.appendFile(resultFilePath, "timestamp,type,data\n");
    }

    const tailPromises = [];
    const startTime = Date.now();

    if (tailLogs) tailPromises.push(this.tailLogs(executionId, startTime));
    if (tailStepResults) tailPromises.push(this.tailStepResults(executionId, startTime));

    await Promise.all(tailPromises);
  }

  private async tailLogs(executionId: string, startTime: number) {
    const {
      flags: { "auto-end": autoEndPoll, "result-file": resultFilePath },
    } = await this.parse(CniTestFlowCommand);

    let nextCursor: string | undefined = undefined;

    while (true) {
      await ux.wait(this.getPollIntervalMs());

      const result: any = await this.fetchLogs(executionId, nextCursor);
      if (result === undefined) continue;

      const { logs, cursor } = result;
      nextCursor = cursor;

      ux.table(
        logs,
        {
          timestamp: {},
          severity: {
            minWidth: 15,
          },
          message: {},
        },
        {
          "no-header": true,
        },
      );

      if (resultFilePath) {
        for (const log of logs) {
          fs.appendFile(resultFilePath, `${log.timestamp},${log.severity},${log.message}\n`);
        }
      }

      if (await this.shouldEnd(executionId, autoEndPoll)) {
        return;
      }
    }
  }

  private async tailStepResults(executionId: string, startTime: number) {
    const {
      flags: { "auto-end": autoEndPoll, "result-file": resultFilePath },
    } = await this.parse(CniTestFlowCommand);

    let nextCursor: string | undefined = undefined;

    while (true) {
      await ux.wait(this.getPollIntervalMs());

      const result: any = await this.fetchStepResults(executionId, nextCursor);
      if (result === undefined) {
        continue;
      }

      const { stepResults, cursor } = result;
      nextCursor = cursor;

      ux.table(
        stepResults,
        {
          endedAt: {},
          type: {
            minWidth: 15,
          },
          result: {},
        },
        {
          "no-header": true,
        },
      );

      if (resultFilePath) {
        for (const result of stepResults) {
          fs.appendFile(
            resultFilePath,
            `${result.endedAt},${result.type},${JSON.stringify(result.result)}\n`,
          );
        }
      }

      if (await this.shouldEnd(executionId, autoEndPoll)) {
        return;
      }
    }
  }

  private async fetchLogs(
    executionId: string,
    nextCursor?: string,
  ): Promise<FetchLogsResult | undefined> {
    const results = await listExecutionLogs(executionId, nextCursor);

    const { edges }: { edges: { node: LogNode; cursor?: string }[] } = results.logs;
    if (!edges || edges.length === 0) {
      return undefined;
    }

    const logs = edges.map(({ node }) => node);

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor };
  }

  private async fetchStepResults(executionId: string, nextCursor?: string) {
    const results = await listExecutionStepResults(executionId, nextCursor);

    const { edges }: { edges: { node: StepResultNode; cursor?: string }[] } =
      results.executionResult.stepResults;

    if (!edges || edges.length === 0) {
      return undefined;
    }

    const stepResults: Array<FormattedStepResult> = [];

    for (const edge of edges) {
      const { endedAt, resultsUrl, stepName } = edge.node;

      const response = await axios.get(resultsUrl, {
        responseType: "arraybuffer",
      });
      const resultsBuffer = Buffer.from(await response.data);
      const result = decode(resultsBuffer) as Record<string, unknown>;

      stepResults.push({
        type: stepName === "onTrigger" ? "RESULT_TRIGGER" : "RESULT_FLOW",
        endedAt,
        result,
      });
    }

    const { cursor } = edges[edges.length - 1];
    return { stepResults, cursor };
  }

  private async executionIsComplete(executionId: string) {
    return await cniExecutionIsComplete(executionId);
  }

  private async shouldEnd(executionId: string, autoEndPoll: boolean) {
    return (
      Date.now() - this.startTime > TIMEOUT_MS ||
      (autoEndPoll && (await this.executionIsComplete(executionId)))
    );
  }

  private getPollIntervalMs() {
    const timeElapsed = this.startTime - Date.now();
    if (timeElapsed < 30000) {
      // every 1s for first 30s
      return 1000;
    } else if (timeElapsed < 60000) {
      // every 5s for 30s-1min
      return 5000;
    } else if (timeElapsed < 300000) {
      // every 30s for 1min-5min
      return 30000;
    } else {
      // every 1min for 5min+
      return 60000;
    }
  }
}

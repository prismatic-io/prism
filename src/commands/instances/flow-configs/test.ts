import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListInstanceTestLogsDocument as LIST_INSTANCE_TEST_LOGS } from "../../../graphql/operations/listInstanceTestLogs.generated.js";
import { TestInstanceFlowConfigDocument as TEST_INSTANCE_FLOW_CONFIG } from "../../../graphql/operations/testInstanceFlowConfig.generated.js";
import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

interface LogNode {
  [index: string]: unknown;
  timestamp: string;
  severity: string;
  message: string;
}

interface FetchLogsResult {
  logs: LogNode[];
  cursor: string | undefined;
  executionComplete: boolean | undefined;
}

export default class TestCommand extends PrismaticBaseCommand {
  static description = "Test a Flow Config of an Instance";
  static args = {
    flowConfig: Args.string({
      description: "ID of a Flow Config to test",
      required: true,
    }),
  };

  static flags = {
    ...ux.table.flags({ only: ["extended", "columns"] }),
    tail: Flags.boolean({
      required: false,
      char: "t",
      description: "Tail logs of the flow config test run",
    }),
    payload: Flags.string({
      required: false,
      char: "p",
      description: "Optional JSON-formatted data payload to submit with the test",
    }),
    contentType: Flags.string({
      required: false,
      char: "c",
      description: "Optional content-type for the test payload",
    }),
  };

  async run() {
    const {
      args: { flowConfig },
      flags: { tail, payload, contentType },
    } = await this.parse(TestCommand);

    const result: ResultOf<typeof TEST_INSTANCE_FLOW_CONFIG> = await gqlRequest({
      document: TEST_INSTANCE_FLOW_CONFIG,
      variables: {
        id: flowConfig,
        payload,
        contentType,
      },
    });

    if (!tail) {
      return;
    }

    const executionId =
      result.testInstanceFlowConfig?.testInstanceFlowConfigResult?.execution?.id ??
      this.error("Flow config test did not create an execution");
    await this.tailLogs(executionId);
  }

  private async tailLogs(executionId: string) {
    const { flags } = await this.parse(TestCommand);

    let nextCursor: string | undefined;
    while (true) {
      await ux.wait(500);

      const result: any = await this.fetchLogs(executionId, nextCursor);
      if (result === undefined) continue;

      const { logs, cursor, executionComplete } = result;

      nextCursor = cursor;

      ux.table(
        logs,
        {
          timestamp: {},
          severity: {
            minWidth: 12,
          },
          message: {},
        },
        { ...flags, "no-header": true },
      );

      if (executionComplete) return;
    }
  }

  private async fetchLogs(
    executionId: string,
    nextCursor?: string,
  ): Promise<FetchLogsResult | undefined> {
    const results: ResultOf<typeof LIST_INSTANCE_TEST_LOGS> = await gqlRequest({
      document: LIST_INSTANCE_TEST_LOGS,
      variables: {
        executionId,
        nextCursor,
      },
    });

    const {
      edges,
    }: {
      edges: { cursor?: string; node: LogNode }[];
    } = results.logs;
    if (!edges || edges.length === 0) {
      return undefined;
    }

    const logs = edges.map(({ node }) => node);
    const executionComplete = logs.reduce<boolean>(
      (result: boolean, { message }) => result || message.startsWith("Ending Instance Execution"),
      false,
    );

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor, executionComplete };
  }
}

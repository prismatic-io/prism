import { Command, Flags, Args, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

interface LogNode {
  [index: string]: unknown;
  timestamp: string;
  severity: string;
  message: string;
}

interface FetchLogsResult {
  logs: LogNode[];
  cursor: string | undefined;
  executionComplete: boolean;
}

export default class TestCommand extends Command {
  static description = "Run a test of an Integration Flow";
  static args = {
    flow: Args.string({ description: "ID of a flow to test", required: true }),
  };

  static flags = {
    ...ux.table.flags({ only: ["extended", "columns"] }),
    tail: Flags.boolean({
      char: "t",
      description: "Tail logs of the integration test run",
      required: false,
    }),
    payload: Flags.string({
      char: "p",
      description: "Optional JSON-formatted data payload to submit with the test",
      required: false,
    }),
    contentType: Flags.string({
      char: "c",
      description: "Optional content-type for the test payload",
      required: false,
    }),
  };

  async run() {
    const {
      args: { flow },
      flags: { tail, payload, contentType },
    } = await this.parse(TestCommand);

    const result = await gqlRequest({
      document: gql`
        mutation testIntegrationFlow(
          $id: ID!
          $payload: String
          $contentType: String
        ) {
          testIntegrationFlow(
            input: { id: $id, payload: $payload, contentType: $contentType }
          ) {
            testIntegrationFlowResult {
              flow {
                id
              }
              execution {
                id
              }
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: flow,
        payload,
        contentType,
      },
    });
    const executionId = result.testIntegrationFlow.testIntegrationFlowResult.execution.id;
    console.log(`Execution ID: ${executionId}`);
    if (tail) {
      await this.tailLogs(executionId);
    }
  }

  private async tailLogs(executionId: string) {
    const { flags } = await this.parse(TestCommand);

    let nextCursor: string | undefined = undefined;
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
    const results = await gqlRequest({
      document: gql`
        query listIntegrationTestLogs($executionId: ID!, $nextCursor: String) {
          logs(
            executionResult: $executionId
            after: $nextCursor
            orderBy: { field: TIMESTAMP, direction: ASC }
          ) {
            edges {
              node {
                timestamp
                severity
                message
              }
              cursor
            }
          }
        }
      `,
      variables: {
        executionId,
        nextCursor,
      },
    });

    const { edges }: { edges: { node: LogNode; cursor?: string }[] } = results.logs;
    if (!edges || edges.length === 0) {
      return undefined;
    }

    const logs = edges.map(({ node }) => node);
    const executionComplete = logs.reduce(
      (result: boolean, { message }) => result || message.startsWith("Ending Instance"),
      false,
    );

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor, executionComplete };
  }
}

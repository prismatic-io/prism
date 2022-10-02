import { Command, Flags, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

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

export default class TestCommand extends Command {
  static description = "Test a Flow Config of an Instance";
  static args = [
    {
      name: "flowConfig",
      description: "ID of a Flow Config to test",
      required: true,
    },
  ];

  static flags = {
    ...CliUx.ux.table.flags({ only: ["extended", "columns"] }),
    tail: Flags.boolean({
      required: false,
      char: "t",
      description: "Tail logs of the flow config test run",
    }),
    payload: Flags.string({
      required: false,
      char: "p",
      description:
        "Optional JSON-formatted data payload to submit with the test",
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

    const result = await gqlRequest({
      document: gql`
        mutation testInstanceFlowConfig(
          $id: ID!
          $payload: String
          $contentType: String
        ) {
          testInstanceFlowConfig(
            input: { id: $id, payload: $payload, contentType: $contentType }
          ) {
            testInstanceFlowConfigResult {
              flowConfig {
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
        id: flowConfig,
        payload,
        contentType,
      },
    });

    if (!tail) {
      return;
    }

    const executionId =
      result.testInstanceFlowConfig.testInstanceFlowConfigResult.execution.id;
    await this.tailLogs(executionId);
  }

  private async tailLogs(executionId: string) {
    const { flags } = await this.parse(TestCommand);

    let nextCursor: string | undefined = undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await CliUx.ux.wait(500);

      const result: any = await this.fetchLogs(executionId, nextCursor);
      if (result === undefined) continue;

      const { logs, cursor, executionComplete } = result;

      nextCursor = cursor;

      CliUx.ux.table(
        logs,
        {
          timestamp: {},
          severity: {
            minWidth: 12,
          },
          message: {},
        },
        { ...flags, "no-header": true }
      );

      if (executionComplete) return;
    }
  }

  private async fetchLogs(
    executionId: string,
    nextCursor?: string
  ): Promise<FetchLogsResult | undefined> {
    const results = await gqlRequest({
      document: gql`
        query listInstanceTestLogs($executionId: ID!, $nextCursor: String) {
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
      (result: boolean, { message }) =>
        result || message.startsWith("Ending Instance Execution"),
      false
    );

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor, executionComplete };
  }
}

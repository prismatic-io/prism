import { arg, commandInput, defineCommand, option, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
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

export default defineCommand({
  description: "Test a Flow Config of an Instance",
  args: {
    flowConfig: arg.string({
      description: "ID of a Flow Config to test",
      required: true,
    }),
  },
  options: {
    ...ux.table.flags({ only: ["extended", "columns"] }),
    tail: option.boolean({
      required: false,
      char: "t",
      description: "Tail logs of the flow config test run",
    }),
    payload: option.string({
      required: false,
      char: "p",
      description: "Optional JSON-formatted data payload to submit with the test",
    }),
    contentType: option.string({
      required: false,
      char: "c",
      description: "Optional content-type for the test payload",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { flowConfig },
      flags: { tail, payload, contentType },
    } = commandInput();

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

    const executionId = result.testInstanceFlowConfig.testInstanceFlowConfigResult.execution.id;
    await this.tailLogs(executionId);
  },
  async tailLogs(executionId: string) {
    const { flags } = commandInput();

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
  },
  async fetchLogs(executionId: string, nextCursor?: string): Promise<FetchLogsResult | undefined> {
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
      (result: boolean, { message }) => result || message.startsWith("Ending Instance Execution"),
      false,
    );

    const { cursor } = edges[edges.length - 1];
    return { logs, cursor, executionComplete };
  },
});

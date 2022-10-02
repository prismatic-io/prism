import { CliUx } from "@oclif/core";
import chalk from "chalk";
import { formatTimestamp } from "../date";
import { gqlRequest, gql } from "../../graphql";
import { promisify } from "util";

const setTimeoutPromise = promisify(setTimeout);

interface Log {
  [key: string]: string;
  timestamp: string;
  severity: string;
  message: string;
}

export const waitForExecutionCompletion = (
  executionId: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await gqlRequest({
          document: gql`
            query pollExecution($executionId: ID!) {
              executionResult(id: $executionId) {
                endedAt
              }
            }
          `,
          variables: { executionId },
        });

        const { endedAt } = result.executionResult;
        if (endedAt) {
          clearInterval(interval);

          // Grace period to let logs finish flowing; logs are fully async and are
          // not guaranteed to be added in chronological order.
          await setTimeoutPromise(1000);

          resolve();
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 1000);
  });
};

export const displayLogs = async (executionId: string): Promise<void> => {
  await waitForExecutionCompletion(executionId);

  // TODO: Add paging
  const result = await gqlRequest({
    document: gql`
      query logs($executionId: ID!) {
        executionResult(id: $executionId) {
          logs(orderBy: { field: TIMESTAMP, direction: ASC }) {
            nodes {
              timestamp
              severity
              message
            }
          }
        }
      }
    `,
    variables: { executionId },
  });

  const logs: Log[] = result.executionResult.logs.nodes;
  CliUx.ux.table(
    logs,
    {
      timestamp: {
        get: ({ timestamp }) => formatTimestamp(timestamp),
      },
      severity: {
        minWidth: 12,
        get: ({ severity }) => {
          if (severity == "INFO") {
            return chalk.blue("info");
          }
          if (severity == "WARN") {
            return chalk.yellow("warn");
          }
          if (severity == "ERROR") {
            return chalk.red("error");
          }
          return severity.toLowerCase();
        },
      },
      message: {},
    },
    { "no-header": true }
  );
};

import inquirer from "inquirer";
import { gqlRequest, gql } from "../../graphql.js";
import { handleError } from "../errors.js";

export type IntegrationFlow = {
  id: string;
  name: string;
  description: string;
  stableKey: string;
  testUrl: string;
  trigger: {
    action: {
      component: {
        key: string;
      };
      isPollingTrigger: boolean;
      scheduleSupport: string;
    };
  };
};

export async function getIntegrationFlows(integrationId: string) {
  let flows: Array<IntegrationFlow> = [];
  let hasNextPage = true;
  let cursor = "";

  while (hasNextPage) {
    const {
      integration: {
        flows: { nodes, pageInfo },
      },
    } = await gqlRequest({
      document: gql`
        query getIntegrationFlows($id: ID!, $after: String) {
          integration(id: $id) {
            flows(after: $after) {
              nodes {
                id
                stableKey
                name
                description
                testUrl
                trigger {
                  action {
                    component {
                      key
                    }
                    isPollingTrigger
                    scheduleSupport
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      variables: {
        id: integrationId,
        after: cursor,
      },
    });
    flows = [...flows, ...nodes];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }

  return flows;
}

export interface LogNode {
  [index: string]: unknown;
  timestamp: string;
  severity: string;
  message: string;
}

export interface FetchLogsResult {
  logs: LogNode[];
  cursor: string | undefined;
  executionComplete?: boolean;
}

export async function getExecutionLogs(executionId: string, nextCursor?: string) {
  return await gqlRequest({
    document: gql`
      query getExecutionLogs($executionId: ID!, $nextCursor: String) {
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
}

export interface StepResultNode {
  [index: string]: unknown;
  stepName: string;
  endedAt: string;
  resultsUrl: string;
}

export async function getExecutionStepResults(executionId: string, nextCursor?: string) {
  return await gqlRequest({
    document: gql`
      query getExecutionStepResults($executionId: ID!, $nextCursor: String) {
        executionResult(id: $executionId) {
          stepResults(after: $nextCursor, orderBy: { field: ENDED_AT, direction: ASC }) {
            edges {
              node {
                stepName
                endedAt
                resultsUrl
              }
              cursor
            }
            totalCount
          }
        }
      }
    `,
    variables: {
      executionId,
      nextCursor,
    },
  });
}

export async function isCniExecutionComplete(executionId: string) {
  const result = await gqlRequest({
    document: gql`
      query isCniExecutionComplete($executionId: ID!) {
        executionResult(id: $executionId) {
          stepResults {
            totalCount
          }
        }
      }
    `,
    variables: {
      executionId,
    },
  });

  return result.executionResult.stepResults.totalCount === 2;
}

export type SelectFlowOptions = {
  /** The prompt message to show the user */
  message?: string;
  /** Error message when no flows are found */
  noFlowsError?: string;
  /** Error message when lookup fails */
  lookupError?: string;
};

/**
 * Prompt the user to select a flow from an integration.
 * @param integrationId - The integration ID to fetch flows from
 * @param options - Optional configuration for prompts and error messages
 * @returns The selected flow, or throws if no flows or lookup fails
 */
export async function selectFlowPrompt(
  integrationId: string,
  options: SelectFlowOptions = {},
): Promise<IntegrationFlow> {
  const {
    message = "Select a flow:",
    noFlowsError = "No flows were found for the given integration.",
    lookupError = "There was an error looking up flows for your integration. Please provide an integration ID or reimport your integration.",
  } = options;

  try {
    const flows = await getIntegrationFlows(integrationId);

    if (flows.length === 0) {
      handleError({
        message: noFlowsError,
        throwError: true,
      });
    }

    const { selectedFlow } = await inquirer.prompt({
      type: "list",
      name: "selectedFlow",
      message,
      choices: flows.map((flow) => ({
        name: `${flow.name} ${flow.stableKey ? `(${flow.stableKey})` : ""}`,
        value: flow,
      })),
    });

    return selectedFlow;
  } catch (err) {
    // Re-throw if it's our own error from handleError
    if (err instanceof Error && err.message === noFlowsError) {
      throw err;
    }
    handleError({
      message: lookupError,
      throwError: true,
    });
    throw err; // TypeScript needs this even though handleError throws
  }
}

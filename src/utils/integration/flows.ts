import { gqlRequest, gql } from "../../graphql.js";

type IntegrationFlow = {
  id: string;
  name: string;
  description: string;
  stableKey: string;
  testUrl: string;
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

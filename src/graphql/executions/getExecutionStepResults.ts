import { gql } from "../../graphql.js";

export const GET_EXECUTION_STEP_RESULTS = gql`
  query GetExecutionStepResults($executionId: ID!, $nextCursor: String) {
    executionResult(id: $executionId) {
      stepResults(
        after: $nextCursor
        orderBy: { field: ENDED_AT, direction: ASC }
      ) {
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
`;

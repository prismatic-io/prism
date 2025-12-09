import { gql } from "../../graphql.js";

export const GET_POLLED_EXECUTION = gql`
  query GetPolledExecution($executionId: ID!) {
    executionResult(id: $executionId) {
      id
      endedAt
      stepResults(orderBy: { direction: ASC, field: STARTED_AT }, first: 1) {
        nodes {
          id
          stepName
          resultsUrl
        }
      }
    }
  }
`;

import { gql } from "../../graphql.js";

export const GET_EXECUTION_LOGS = gql`
  query GetExecutionLogs($executionId: ID!, $nextCursor: String) {
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
`;

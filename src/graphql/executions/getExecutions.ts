import { gql } from "../../graphql.js";

export const GET_EXECUTIONS = gql`
  query GetExecutions(
    $flowId: ID
    $isTestExecution: Boolean
    $limit: Int
    $startDate: DateTime
  ) {
    executionResults(
      first: $limit
      isTestExecution: $isTestExecution
      startedAt_Gte: $startDate
      flowConfig_Flow: $flowId
    ) {
      nodes {
        id
        endedAt
        requestPayloadUrl
        responsePayloadUrl
      }
    }
  }
`;

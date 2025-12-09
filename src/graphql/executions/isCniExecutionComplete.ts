import { gql } from "../../graphql.js";

export const IS_CNI_EXECUTION_COMPLETE = gql`
  query IsCniExecutionComplete($executionId: ID!) {
    executionResult(id: $executionId) {
      stepResults {
        totalCount
      }
    }
  }
`;

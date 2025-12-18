import { gql } from "../../graphql.js";

export const TEST_INTEGRATION_FLOW = gql`
  mutation TestIntegrationFlow($id: ID!) {
    testIntegrationFlow(input: { id: $id }) {
      testIntegrationFlowResult {
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
`;

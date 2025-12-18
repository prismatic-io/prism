import { gql } from "../../graphql.js";

export const UPDATE_INTEGRATION_FLOW_LISTENING_MODE = gql`
  mutation UpdateIntegrationFlowListeningMode(
    $integrationId: ID!
    $isListening: Boolean
  ) {
    updateWorkflowTestConfiguration(
      input: { id: $integrationId, listeningMode: $isListening }
    ) {
      errors {
        field
        messages
      }
    }
  }
`;

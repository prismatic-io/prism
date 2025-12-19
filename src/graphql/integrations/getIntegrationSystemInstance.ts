import { gql } from "../../graphql.js";

export const GET_INTEGRATION_SYSTEM_INSTANCE = gql`
  query GetIntegrationSystemInstance($integrationId: ID!) {
    integration(id: $integrationId) {
      isCodeNative
      systemInstance {
        id
        configState
      }
    }
  }
`;

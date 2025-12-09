import { gql } from "../../graphql.js";

export const GET_INTEGRATION_FLOWS = gql`
  query GetIntegrationFlows($id: ID!, $after: String) {
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
`;

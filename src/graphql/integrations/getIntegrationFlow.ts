import { gql } from "../../graphql.js";

export const GET_INTEGRATION_FLOW = gql`
  query GetIntegrationFlow($id: ID!) {
    integration(id: $id) {
      flows {
        nodes {
          id
          name
        }
      }
    }
  }
`;

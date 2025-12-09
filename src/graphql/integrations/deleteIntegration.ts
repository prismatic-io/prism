import { gql } from "../../graphql.js";

export const DELETE_INTEGRATION = gql`
  mutation DeleteIntegration($id: ID!) {
    deleteIntegration(input: { id: $id }) {
      errors {
        field
        messages
      }
    }
  }
`;

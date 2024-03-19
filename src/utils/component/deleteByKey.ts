import { gql, gqlRequest } from "../../graphql.js";

export const deleteComponentByKey = async (key: string) => {
  // Fetch a component by key
  const result = await gqlRequest({
    document: gql`
      query component($key: String!) {
        components(key: $key, public: false) {
          nodes {
            id
          }
        }
      }
    `,
    variables: {
      key,
    },
  });
  // Delete the component by ID
  await gqlRequest({
    document: gql`
      mutation deleteComponent($id: ID!) {
        deleteComponent(input: { id: $id }) {
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: { id: result.components.nodes[0].id },
  });
};

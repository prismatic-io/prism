import { gql, gqlRequest } from "../../graphql";

export const deleteComponentByKey = async (key: string) => {
  // Retrieve the existing signature of the component if it exists.
  const result = await gqlRequest({
    document: gql`
      query component($key: String!) {
        components(key: $key) {
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

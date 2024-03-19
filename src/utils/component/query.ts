import { gqlRequest, gql } from "../../graphql.js";

interface ComponentInfo {
  id: string;
  key: string;
  versionNumber: string;
  public: boolean;
}

export const queryComponentKeys = async (keys: string[]): Promise<ComponentInfo[]> => {
  const result = await gqlRequest({
    document: gql`
      query components($keys: [String]!) {
        components(key_In: $keys) {
          nodes {
            id
            key
            versionNumber
            public
          }
        }
      }
    `,
    variables: { keys },
  });

  return result.components.nodes;
};

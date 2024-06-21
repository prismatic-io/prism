import { gqlRequest, gql } from "../../graphql.js";
import { ComponentDefinition } from "./index.js";

interface GetPackageSignatureFromApiProps {
  componentDefinition: ComponentDefinition;
  packageSignature: string;
}

export const getPackageSignatureFromApi = async ({
  componentDefinition,
  packageSignature,
}: GetPackageSignatureFromApiProps): Promise<string | null> => {
  const results = await gqlRequest({
    document: gql`
      query component($key: String!, $public: Boolean!) {
        components(key: $key, public: $public) {
          nodes {
            signature
          }
        }
      }
    `,
    variables: {
      key: componentDefinition.key,
      public: componentDefinition.public ?? false,
    },
  });

  const {
    components: {
      nodes: [{ signature: existingSignature } = { signature: null }],
    },
  } = results;

  return existingSignature === packageSignature ? packageSignature : null;
};

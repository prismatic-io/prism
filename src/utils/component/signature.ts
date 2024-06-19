import { gqlRequest, gql } from "../../graphql.js";
import { ComponentDefinition } from "./index.js";

interface GetPackageSignatureFromApiProps {
  componentDefinition: ComponentDefinition;
  customer?: string;
  packageSignature: string;
}

export const getPackageSignatureFromApi = async ({
  componentDefinition,
  customer,
  packageSignature,
}: GetPackageSignatureFromApiProps): Promise<string | null> => {
  const results = await gqlRequest({
    document: gql`
      query component($key: String!, $public: Boolean!, $customer: ID) {
        components(key: $key, public: $public, customer: $customer) {
          nodes {
            signature
          }
        }
      }
    `,
    variables: {
      key: componentDefinition.key,
      public: componentDefinition.public ?? false,
      customer,
    },
  });

  const {
    components: {
      nodes: [{ signature: existingSignature } = { signature: null }],
    },
  } = results;

  return existingSignature === packageSignature ? packageSignature : null;
};

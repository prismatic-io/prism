import { Component3Document as COMPONENT3 } from "../../graphql/operations/component3.generated.js";
import { gqlRequest } from "../../graphql.js";
import type { ComponentDefinition } from "./index.js";

interface GetPackageSignatureFromApiProps {
  componentDefinition: ComponentDefinition;
  packageSignature: string;
}

export const getPackageSignatureFromApi = async ({
  componentDefinition,
  packageSignature,
}: GetPackageSignatureFromApiProps): Promise<string | null> => {
  const results = await gqlRequest({
    document: COMPONENT3,
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

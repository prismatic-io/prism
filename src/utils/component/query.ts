import { ComponentsDocument as COMPONENTS } from "../../graphql/operations/components.generated.js";
import { gqlRequest } from "../../graphql.js";

interface ComponentInfo {
  id: string;
  key: string;
  versionNumber: number;
  public: boolean;
}

export const queryComponentKeys = async (keys: string[]): Promise<ComponentInfo[]> => {
  const result = await gqlRequest({
    document: COMPONENTS,
    variables: { keys },
  });

  return result.components.nodes;
};

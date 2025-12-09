import * as Types from "../schema.generated.js";

export type GetIntegrationFlowQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetIntegrationFlowQuery = {
  __typename?: "RootQuery";
  integration?: {
    __typename?: "Integration";
    flows: {
      __typename?: "IntegrationFlowConnection";
      nodes: Array<{ __typename?: "IntegrationFlow"; id: string; name: string } | null>;
    };
  } | null;
};

import * as Types from "../schema.generated.js";

export type TestIntegrationFlowMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type TestIntegrationFlowMutation = {
  __typename?: "RootMutation";
  testIntegrationFlow?: {
    __typename?: "TestIntegrationFlowPayload";
    testIntegrationFlowResult?: {
      __typename?: "TestIntegrationFlowResult";
      execution?: { __typename?: "InstanceExecutionResult"; id: string } | null;
    } | null;
    errors: Array<{ __typename?: "ErrorType"; field: string; messages: Array<string> }>;
  } | null;
};

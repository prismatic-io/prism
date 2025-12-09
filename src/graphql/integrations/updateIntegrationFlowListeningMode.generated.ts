import * as Types from "../schema.generated.js";

export type UpdateIntegrationFlowListeningModeMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
  isListening?: Types.InputMaybe<Types.Scalars["Boolean"]["input"]>;
}>;

export type UpdateIntegrationFlowListeningModeMutation = {
  __typename?: "RootMutation";
  updateWorkflowTestConfiguration?: {
    __typename?: "UpdateWorkflowTestConfigurationPayload";
    errors: Array<{ __typename?: "ErrorType"; field: string; messages: Array<string> }>;
  } | null;
};

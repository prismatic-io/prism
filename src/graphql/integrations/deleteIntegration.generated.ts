import * as Types from "../schema.generated.js";

export type DeleteIntegrationMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type DeleteIntegrationMutation = {
  __typename?: "RootMutation";
  deleteIntegration?: {
    __typename?: "DeleteIntegrationPayload";
    errors: Array<{ __typename?: "ErrorType"; field: string; messages: Array<string> }>;
  } | null;
};

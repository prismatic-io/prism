import * as Types from "../schema.generated.js";

export type IsCniExecutionCompleteQueryVariables = Types.Exact<{
  executionId: Types.Scalars["ID"]["input"];
}>;

export type IsCniExecutionCompleteQuery = {
  __typename?: "RootQuery";
  executionResult?: {
    __typename?: "InstanceExecutionResult";
    stepResults: { __typename?: "InstanceStepResultConnection"; totalCount: number };
  } | null;
};

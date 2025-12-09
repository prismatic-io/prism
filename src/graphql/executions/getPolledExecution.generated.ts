import * as Types from "../schema.generated.js";

export type GetPolledExecutionQueryVariables = Types.Exact<{
  executionId: Types.Scalars["ID"]["input"];
}>;

export type GetPolledExecutionQuery = {
  __typename?: "RootQuery";
  executionResult?: {
    __typename?: "InstanceExecutionResult";
    id: string;
    endedAt?: any | null;
    stepResults: {
      __typename?: "InstanceStepResultConnection";
      nodes: Array<{
        __typename?: "InstanceStepResult";
        id: string;
        stepName?: string | null;
        resultsUrl: string;
      } | null>;
    };
  } | null;
};

import * as Types from "../schema.generated.js";

export type GetExecutionStepResultsQueryVariables = Types.Exact<{
  executionId: Types.Scalars["ID"]["input"];
  nextCursor?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetExecutionStepResultsQuery = {
  __typename?: "RootQuery";
  executionResult?: {
    __typename?: "InstanceExecutionResult";
    stepResults: {
      __typename?: "InstanceStepResultConnection";
      totalCount: number;
      edges: Array<{
        __typename?: "InstanceStepResultEdge";
        cursor: string;
        node?: {
          __typename?: "InstanceStepResult";
          stepName?: string | null;
          endedAt?: any | null;
          resultsUrl: string;
        } | null;
      } | null>;
    };
  } | null;
};

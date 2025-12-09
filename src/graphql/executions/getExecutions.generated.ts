import * as Types from "../schema.generated.js";

export type GetExecutionsQueryVariables = Types.Exact<{
  flowId?: Types.InputMaybe<Types.Scalars["ID"]["input"]>;
  isTestExecution?: Types.InputMaybe<Types.Scalars["Boolean"]["input"]>;
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  startDate?: Types.InputMaybe<Types.Scalars["DateTime"]["input"]>;
}>;

export type GetExecutionsQuery = {
  __typename?: "RootQuery";
  executionResults: {
    __typename?: "InstanceExecutionResultConnection";
    nodes: Array<{
      __typename?: "InstanceExecutionResult";
      id: string;
      endedAt?: any | null;
      requestPayloadUrl: string;
      responsePayloadUrl: string;
    } | null>;
  };
};

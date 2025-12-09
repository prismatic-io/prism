import * as Types from "../schema.generated.js";

export type GetExecutionLogsQueryVariables = Types.Exact<{
  executionId: Types.Scalars["ID"]["input"];
  nextCursor?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetExecutionLogsQuery = {
  __typename?: "RootQuery";
  logs: {
    __typename?: "LogConnection";
    edges: Array<{
      __typename?: "LogEdge";
      cursor: string;
      node?: {
        __typename?: "Log";
        timestamp: any;
        severity: Types.LogSeverityLevel;
        message: string;
      } | null;
    } | null>;
  };
};

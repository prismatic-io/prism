import * as Types from "../schema.generated.js";

export type GetIntegrationFlowsQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
  after?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetIntegrationFlowsQuery = {
  __typename?: "RootQuery";
  integration?: {
    __typename?: "Integration";
    flows: {
      __typename?: "IntegrationFlowConnection";
      nodes: Array<{
        __typename?: "IntegrationFlow";
        id: string;
        stableKey?: string | null;
        name: string;
        description?: string | null;
        testUrl: string;
        trigger: {
          __typename?: "IntegrationAction";
          action: {
            __typename?: "Action";
            isPollingTrigger?: boolean | null;
            scheduleSupport?: Types.ActionScheduleSupport | null;
            component?: { __typename?: "Component"; key: string } | null;
          };
        };
      } | null>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean; endCursor?: string | null };
    };
  } | null;
};

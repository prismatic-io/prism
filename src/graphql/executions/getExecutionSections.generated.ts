import type * as Types from "../schema.generated.js";

export type GetExecutionSectionsQueryVariables = Types.Exact<{
  executionId: Types.Scalars["ID"]["input"];
  sectionIds?: Types.InputMaybe<Array<Types.InputMaybe<Types.Scalars["UUID"]["input"]>>>;
}>;

export type GetExecutionSectionsQuery = {
  __typename?: "RootQuery";
  executionSections: {
    __typename?: "ExecutionSectionConnection";
    nodes: Array<{
      __typename?: "ExecutionSection";
      sectionId?: any | null;
      label: string;
    } | null>;
  };
};

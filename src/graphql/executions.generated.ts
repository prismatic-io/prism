import * as Types from "../generated/graphql.js";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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

export const GetExecutionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetExecutions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "flowId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTestExecution" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "limit" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startDate" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionResults" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "limit" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "isTestExecution" },
                value: { kind: "Variable", name: { kind: "Name", value: "isTestExecution" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAt_Gte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startDate" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "flowConfig_Flow" },
                value: { kind: "Variable", name: { kind: "Name", value: "flowId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "requestPayloadUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "responsePayloadUrl" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetExecutionsQuery, GetExecutionsQueryVariables>;
export const GetPolledExecutionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetPolledExecution" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionResult" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepResults" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "ASC" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "STARTED_AT" },
                          },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "1" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "stepName" } },
                            { kind: "Field", name: { kind: "Name", value: "resultsUrl" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPolledExecutionQuery, GetPolledExecutionQueryVariables>;
export const GetExecutionLogsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetExecutionLogs" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "nextCursor" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "logs" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "executionResult" },
                value: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: { kind: "Variable", name: { kind: "Name", value: "nextCursor" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "field" },
                      value: { kind: "EnumValue", value: "TIMESTAMP" },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "direction" },
                      value: { kind: "EnumValue", value: "ASC" },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "timestamp" } },
                            { kind: "Field", name: { kind: "Name", value: "severity" } },
                            { kind: "Field", name: { kind: "Name", value: "message" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "cursor" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetExecutionLogsQuery, GetExecutionLogsQueryVariables>;
export const GetExecutionStepResultsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetExecutionStepResults" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "nextCursor" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionResult" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepResults" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "after" },
                      value: { kind: "Variable", name: { kind: "Name", value: "nextCursor" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "ENDED_AT" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "ASC" },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "edges" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "node" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "stepName" } },
                                  { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                                  { kind: "Field", name: { kind: "Name", value: "resultsUrl" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "cursor" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetExecutionStepResultsQuery, GetExecutionStepResultsQueryVariables>;
export const IsCniExecutionCompleteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "IsCniExecutionComplete" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionResult" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "executionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepResults" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IsCniExecutionCompleteQuery, IsCniExecutionCompleteQueryVariables>;

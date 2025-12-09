import * as Types from "../generated/graphql.js";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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

export type GetIntegrationFlowQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetIntegrationFlowQuery = {
  __typename?: "RootQuery";
  integration?: {
    __typename?: "Integration";
    flows: {
      __typename?: "IntegrationFlowConnection";
      nodes: Array<{ __typename?: "IntegrationFlow"; id: string; name: string } | null>;
    };
  } | null;
};

export type TestIntegrationFlowMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type TestIntegrationFlowMutation = {
  __typename?: "RootMutation";
  testIntegrationFlow?: {
    __typename?: "TestIntegrationFlowPayload";
    testIntegrationFlowResult?: {
      __typename?: "TestIntegrationFlowResult";
      execution?: { __typename?: "InstanceExecutionResult"; id: string } | null;
    } | null;
    errors: Array<{ __typename?: "ErrorType"; field: string; messages: Array<string> }>;
  } | null;
};

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

export const UpdateIntegrationFlowListeningModeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateIntegrationFlowListeningMode" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isListening" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkflowTestConfiguration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "listeningMode" },
                      value: { kind: "Variable", name: { kind: "Name", value: "isListening" } },
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
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
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
} as unknown as DocumentNode<
  UpdateIntegrationFlowListeningModeMutation,
  UpdateIntegrationFlowListeningModeMutationVariables
>;
export const GetIntegrationFlowsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetIntegrationFlows" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "after" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "integration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "flows" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "after" },
                      value: { kind: "Variable", name: { kind: "Name", value: "after" } },
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
                            { kind: "Field", name: { kind: "Name", value: "stableKey" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "description" } },
                            { kind: "Field", name: { kind: "Name", value: "testUrl" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "trigger" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "action" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "component" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "key" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "isPollingTrigger" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "scheduleSupport" },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                            { kind: "Field", name: { kind: "Name", value: "endCursor" } },
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
} as unknown as DocumentNode<GetIntegrationFlowsQuery, GetIntegrationFlowsQueryVariables>;
export const GetIntegrationFlowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetIntegrationFlow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
            name: { kind: "Name", value: "integration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "flows" },
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
                            { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<GetIntegrationFlowQuery, GetIntegrationFlowQueryVariables>;
export const TestIntegrationFlowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TestIntegrationFlow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
            name: { kind: "Name", value: "testIntegrationFlow" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
                  name: { kind: "Name", value: "testIntegrationFlowResult" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "execution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
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
} as unknown as DocumentNode<TestIntegrationFlowMutation, TestIntegrationFlowMutationVariables>;
export const DeleteIntegrationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteIntegration" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
            name: { kind: "Name", value: "deleteIntegration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
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
} as unknown as DocumentNode<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetExecutionsQueryVariables = Exact<{
  flowId?: string | number | null | undefined;
  isTestExecution?: boolean | null | undefined;
  limit?: number | null | undefined;
  startDate?: string | null | undefined;
}>;

export type GetExecutionsQuery = {
  executionResults: {
    nodes: Array<{
      id: string;
      endedAt: string | null;
      requestPayloadUrl: string;
      responsePayloadUrl: string;
    }>;
  };
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

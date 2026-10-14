/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetExecutionStepResultsQueryVariables = Exact<{
  executionId: string | number;
  nextCursor?: string | null | undefined;
}>;

export type GetExecutionStepResultsQuery = {
  executionResult: {
    stepResults: {
      totalCount: number;
      edges: Array<{
        cursor: string;
        node: { stepName: string | null; endedAt: string | null; resultsUrl: string };
      }>;
    };
  } | null;
};

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

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetStepOutputDetailsQueryVariables = Exact<{
  executionId: string | number;
  stepName: string;
}>;

export type GetStepOutputDetailsQuery = {
  executionResult: {
    id: string;
    stepResults: { nodes: Array<{ displayStepName: string | null; resultsUrl: string }> };
  } | null;
};

export const GetStepOutputDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getStepOutputDetails" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "stepName" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepResults" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "displayStepName" },
                      value: { kind: "Variable", name: { kind: "Name", value: "stepName" } },
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
                            { kind: "Field", name: { kind: "Name", value: "displayStepName" } },
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
} as unknown as DocumentNode<GetStepOutputDetailsQuery, GetStepOutputDetailsQueryVariables>;

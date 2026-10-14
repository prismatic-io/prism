/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type IsCniExecutionCompleteQueryVariables = Exact<{
  executionId: string | number;
}>;

export type IsCniExecutionCompleteQuery = {
  executionResult: { stepResults: { totalCount: number } } | null;
};

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

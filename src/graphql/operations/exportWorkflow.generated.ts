/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ExportWorkflowQueryVariables = Exact<{
  workflow: string | number;
  useLatestComponentVersions?: boolean | null | undefined;
}>;

export type ExportWorkflowQuery = { workflow: { definition: string | null } | null };

export const ExportWorkflowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "exportWorkflow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workflow" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "useLatestComponentVersions" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflow" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "workflow" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "definition" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "definitionType" },
                      value: { kind: "EnumValue", value: "WORKFLOW" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "useLatestComponentVersions" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "useLatestComponentVersions" },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportWorkflowQuery, ExportWorkflowQueryVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ExportQueryVariables = Exact<{
  id: string | number;
  version: number;
  useLatestComponentVersions: boolean;
}>;

export type ExportQuery = { integration: { definition: string | null } | null };

export const ExportDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "export" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "version" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "useLatestComponentVersions" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
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
                  name: { kind: "Name", value: "definition" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "version" },
                      value: { kind: "Variable", name: { kind: "Name", value: "version" } },
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
} as unknown as DocumentNode<ExportQuery, ExportQueryVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ComponentsQueryVariables = Exact<{
  keys: Array<string | null | undefined> | string;
}>;

export type ComponentsQuery = {
  components: { nodes: Array<{ id: string; key: string; versionNumber: number; public: boolean }> };
};

export const ComponentsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "components" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "keys" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "components" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "key_In" },
                value: { kind: "Variable", name: { kind: "Name", value: "keys" } },
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
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "public" } },
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
} as unknown as DocumentNode<ComponentsQuery, ComponentsQueryVariables>;

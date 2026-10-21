/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Component3QueryVariables = Exact<{
  key: string;
  public: boolean;
  signature: string;
}>;

export type Component3Query = {
  components: { nodes: Array<{ id: string; signature: string; versionIsAvailable: boolean }> };
};

export const Component3Document = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "component3" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "public" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "signature" } },
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
            name: { kind: "Name", value: "components" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "key" },
                value: { kind: "Variable", name: { kind: "Name", value: "key" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "public" },
                value: { kind: "Variable", name: { kind: "Name", value: "public" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "signature" },
                value: { kind: "Variable", name: { kind: "Name", value: "signature" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "allVersions" },
                value: { kind: "BooleanValue", value: true },
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
                      { kind: "Field", name: { kind: "Name", value: "signature" } },
                      { kind: "Field", name: { kind: "Name", value: "versionIsAvailable" } },
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
} as unknown as DocumentNode<Component3Query, Component3QueryVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type MarkAvailabilityMutationVariables = Exact<{
  id: string | number;
  available: boolean;
}>;

export type MarkAvailabilityMutation = {
  updateIntegrationVersionAvailability: {
    integration: { id: string } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const MarkAvailabilityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "markAvailability" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "available" } },
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
            name: { kind: "Name", value: "updateIntegrationVersionAvailability" },
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
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "available" },
                      value: { kind: "Variable", name: { kind: "Name", value: "available" } },
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
                  name: { kind: "Name", value: "integration" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
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
} as unknown as DocumentNode<MarkAvailabilityMutation, MarkAvailabilityMutationVariables>;

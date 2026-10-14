/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type IntegrationVersionAvailabilityQueryVariables = Exact<{
  integrationId: string | number;
  versionNumber: number;
}>;

export type IntegrationVersionAvailabilityQuery = {
  integration: { versionSequence: { nodes: Array<{ id: string }> } } | null;
};

export const IntegrationVersionAvailabilityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "integrationVersionAvailability" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "versionSequence" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "versionNumber" },
                      value: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "versionIsAvailable" },
                      value: { kind: "BooleanValue", value: true },
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
                          selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
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
} as unknown as DocumentNode<
  IntegrationVersionAvailabilityQuery,
  IntegrationVersionAvailabilityQueryVariables
>;

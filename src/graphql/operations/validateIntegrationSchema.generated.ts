/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ValidateIntegrationSchemaMutationVariables = Exact<{
  definition: string;
}>;

export type ValidateIntegrationSchemaMutation = {
  validateIntegrationSchema: {
    result: { isValid: boolean | null } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const ValidateIntegrationSchemaDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "validateIntegrationSchema" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "definition" } },
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
            name: { kind: "Name", value: "validateIntegrationSchema" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "definition" },
                      value: { kind: "Variable", name: { kind: "Name", value: "definition" } },
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
                  name: { kind: "Name", value: "result" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "isValid" } }],
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
} as unknown as DocumentNode<
  ValidateIntegrationSchemaMutation,
  ValidateIntegrationSchemaMutationVariables
>;

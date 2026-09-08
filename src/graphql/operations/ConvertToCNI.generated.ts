/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ConvertToCniMutationVariables = Exact<{
  id: string | number;
  registryPrefix?: string | null | undefined;
  registryUrl?: string | null | undefined;
  includeComments?: boolean | null | undefined;
}>;

export type ConvertToCniMutation = {
  convertLowCodeIntegration: {
    convertLowCodeIntegrationFormResult: {
      url: string | null;
      conversionErrors: Array<{
        path: string | null;
        error: string;
        errorType: string;
      } | null> | null;
    } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const ConvertToCniDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ConvertToCNI" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "registryPrefix" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "registryUrl" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeComments" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "convertLowCodeIntegration" },
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
                      name: { kind: "Name", value: "registryPrefix" },
                      value: { kind: "Variable", name: { kind: "Name", value: "registryPrefix" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "registryUrl" },
                      value: { kind: "Variable", name: { kind: "Name", value: "registryUrl" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "includeComments" },
                      value: { kind: "Variable", name: { kind: "Name", value: "includeComments" } },
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
                  name: { kind: "Name", value: "convertLowCodeIntegrationFormResult" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "conversionErrors" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "path" } },
                            { kind: "Field", name: { kind: "Name", value: "error" } },
                            { kind: "Field", name: { kind: "Name", value: "errorType" } },
                          ],
                        },
                      },
                    ],
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
} as unknown as DocumentNode<ConvertToCniMutation, ConvertToCniMutationVariables>;

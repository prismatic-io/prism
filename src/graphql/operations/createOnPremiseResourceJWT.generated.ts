/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type CreateOnPremiseResourceJwtMutationVariables = Exact<{
  customerId?: string | number | null | undefined;
  resourceId?: string | number | null | undefined;
  orgOnly?: boolean | null | undefined;
}>;

export type CreateOnPremiseResourceJwtMutation = {
  createOnPremiseResourceJWT: {
    result: { jwt: string | null } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const CreateOnPremiseResourceJwtDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createOnPremiseResourceJWT" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customerId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "resourceId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "orgOnly" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createOnPremiseResourceJWT" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "customerId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "customerId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "orgOnly" },
                      value: { kind: "Variable", name: { kind: "Name", value: "orgOnly" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "resourceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "resourceId" } },
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
                    selections: [{ kind: "Field", name: { kind: "Name", value: "jwt" } }],
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
  CreateOnPremiseResourceJwtMutation,
  CreateOnPremiseResourceJwtMutationVariables
>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AuthenticatedUserQueryQueryVariables = Exact<{ [key: string]: never }>;

export type AuthenticatedUserQueryQuery = { authenticatedUser: { id: string } };

export const AuthenticatedUserQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AuthenticatedUserQuery" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authenticatedUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuthenticatedUserQueryQuery, AuthenticatedUserQueryQueryVariables>;

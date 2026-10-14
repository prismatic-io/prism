/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type WhoamiQueryVariables = Exact<{ [key: string]: never }>;

export type WhoamiQuery = {
  authenticatedUser: {
    name: string;
    email: string;
    tenantId: string;
    org: { id: string; name: string } | null;
    customer: { id: string; name: string } | null;
  };
};

export const WhoamiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "whoami" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authenticatedUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "org" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "customer" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<WhoamiQuery, WhoamiQueryVariables>;

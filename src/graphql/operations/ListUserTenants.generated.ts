/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ListUserTenantsQueryVariables = Exact<{ [key: string]: never }>;

export type ListUserTenantsQuery = {
  listUserTenants: {
    nodes: Array<{
      tenantId: string;
      url: string;
      orgName: string;
      awsRegion: string;
      systemSuspended: boolean | null;
    }>;
  };
};

export const ListUserTenantsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ListUserTenants" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "listUserTenants" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "tenantId" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      { kind: "Field", name: { kind: "Name", value: "orgName" } },
                      { kind: "Field", name: { kind: "Name", value: "awsRegion" } },
                      { kind: "Field", name: { kind: "Name", value: "systemSuspended" } },
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
} as unknown as DocumentNode<ListUserTenantsQuery, ListUserTenantsQueryVariables>;

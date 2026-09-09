/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ListOrganizationSigningKeysQueryVariables = Exact<{ [key: string]: never }>;

export type ListOrganizationSigningKeysQuery = {
  organization: {
    signingKeys: {
      nodes: Array<{
        id: string;
        publicKey: string;
        privateKeyPreview: string;
        issuedAt: string;
        imported: boolean;
      }>;
    };
  } | null;
};

export const ListOrganizationSigningKeysDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listOrganizationSigningKeys" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "organization" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "signingKeys" },
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
                            { kind: "Field", name: { kind: "Name", value: "publicKey" } },
                            { kind: "Field", name: { kind: "Name", value: "privateKeyPreview" } },
                            { kind: "Field", name: { kind: "Name", value: "issuedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "imported" } },
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
      },
    },
  ],
} as unknown as DocumentNode<
  ListOrganizationSigningKeysQuery,
  ListOrganizationSigningKeysQueryVariables
>;

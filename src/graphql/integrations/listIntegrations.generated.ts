/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ListIntegrationsQueryVariables = Exact<{
  showAllVersions?: boolean | null | undefined;
  after?: string | null | undefined;
  first?: number | null | undefined;
  customer?: string | number | null | undefined;
  customerIsnull?: boolean | null | undefined;
  search?: string | null | undefined;
}>;

export type ListIntegrationsQuery = {
  integrations: {
    nodes: Array<{
      id: string;
      name: string;
      description: string | null;
      versionNumber: number;
      labels: Array<string> | null;
      category: string | null;
      customer: { id: string; name: string; externalId: string | null } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const ListIntegrationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listIntegrations" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "showAllVersions" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "after" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "first" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customerIsnull" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "integrations" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "allVersions" },
                value: { kind: "Variable", name: { kind: "Name", value: "showAllVersions" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: { kind: "Variable", name: { kind: "Name", value: "after" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "first" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "customer" },
                value: { kind: "Variable", name: { kind: "Name", value: "customer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "customer_Isnull" },
                value: { kind: "Variable", name: { kind: "Name", value: "customerIsnull" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name_Icontains" },
                value: { kind: "Variable", name: { kind: "Name", value: "search" } },
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
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "labels" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "customer" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "externalId" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
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
} as unknown as DocumentNode<ListIntegrationsQuery, ListIntegrationsQueryVariables>;

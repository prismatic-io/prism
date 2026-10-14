/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ListComponentsQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  filterQuery?: unknown;
  search?: string | null | undefined;
  category?: string | null | undefined;
  public?: boolean | null | undefined;
  hasActions?: boolean | null | undefined;
  hasTriggers?: boolean | null | undefined;
  hasDataSources?: boolean | null | undefined;
  hasDataSourcesOfType?: string | null | undefined;
  hasConnections?: boolean | null | undefined;
  allVersions?: boolean | null | undefined;
}>;

export type ListComponentsQuery = {
  components: {
    nodes: Array<{
      id: string;
      key: string;
      public: boolean;
      label: string;
      description: string;
      versionNumber: number;
      category: string | null;
      versionCreatedAt: string | null;
      customer: { id: string; externalId: string | null; name: string } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const ListComponentsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listComponents" },
      variableDefinitions: [
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
          variable: { kind: "Variable", name: { kind: "Name", value: "filterQuery" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "JSONString" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "category" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "public" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "hasActions" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "hasTriggers" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "hasDataSources" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "hasDataSourcesOfType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "hasConnections" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "components" },
            arguments: [
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
                name: { kind: "Name", value: "filterQuery" },
                value: { kind: "Variable", name: { kind: "Name", value: "filterQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "searchTerms_Fulltext" },
                value: { kind: "Variable", name: { kind: "Name", value: "search" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "category" },
                value: { kind: "Variable", name: { kind: "Name", value: "category" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "public" },
                value: { kind: "Variable", name: { kind: "Name", value: "public" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "hasActions" },
                value: { kind: "Variable", name: { kind: "Name", value: "hasActions" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "hasTriggers" },
                value: { kind: "Variable", name: { kind: "Name", value: "hasTriggers" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "hasDataSources" },
                value: { kind: "Variable", name: { kind: "Name", value: "hasDataSources" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "hasDataSourcesOfType" },
                value: { kind: "Variable", name: { kind: "Name", value: "hasDataSourcesOfType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "hasConnections" },
                value: { kind: "Variable", name: { kind: "Name", value: "hasConnections" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "allVersions" },
                value: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "field" },
                      value: { kind: "EnumValue", value: "LABEL" },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "direction" },
                      value: { kind: "EnumValue", value: "ASC" },
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
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "public" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      { kind: "Field", name: { kind: "Name", value: "versionCreatedAt" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "customer" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "externalId" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<ListComponentsQuery, ListComponentsQueryVariables>;

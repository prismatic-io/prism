/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ActionDataSourceType =
  /** Boolean */
  | "BOOLEAN"
  /** Code */
  | "CODE"
  /** Connection */
  | "CONNECTION"
  /** Credential */
  | "CREDENTIAL"
  /** Date */
  | "DATE"
  /** Jsonform */
  | "JSONFORM"
  /** Number */
  | "NUMBER"
  /** Objectfieldmap */
  | "OBJECTFIELDMAP"
  /** Objectselection */
  | "OBJECTSELECTION"
  /** Picklist */
  | "PICKLIST"
  /** Schedule */
  | "SCHEDULE"
  /** String */
  | "STRING"
  /** Timestamp */
  | "TIMESTAMP";

export type SearchCatalogQueryVariables = Exact<{
  searchTerms: string;
  componentFilterQuery?: unknown;
  actionFilterQuery?: unknown;
  contextStableKey?: string | null | undefined;
}>;

export type SearchCatalogQuery = {
  componentActionSearchResults: Array<
    | {
        __typename: "Action";
        id: string;
        key: string;
        label: string;
        description: string;
        isTrigger: boolean;
        isDataSource: boolean;
        dataSourceType: Types.ActionDataSourceType | null;
        component: {
          id: string;
          key: string;
          label: string;
          public: boolean;
          category: string | null;
          versionNumber: number;
        } | null;
      }
    | {
        __typename: "Component";
        id: string;
        key: string;
        label: string;
        description: string;
        public: boolean;
        category: string | null;
        versionNumber: number;
      }
    | null
  >;
};

export const SearchCatalogDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "searchCatalog" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "searchTerms" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "componentFilterQuery" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "JSONString" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "actionFilterQuery" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "JSONString" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contextStableKey" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "componentActionSearchResults" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "searchTerms" },
                value: { kind: "Variable", name: { kind: "Name", value: "searchTerms" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "componentFilterQuery" },
                value: { kind: "Variable", name: { kind: "Name", value: "componentFilterQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "actionFilterQuery" },
                value: { kind: "Variable", name: { kind: "Name", value: "actionFilterQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contextStableKey" },
                value: { kind: "Variable", name: { kind: "Name", value: "contextStableKey" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Component" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "public" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Action" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "isTrigger" } },
                      { kind: "Field", name: { kind: "Name", value: "isDataSource" } },
                      { kind: "Field", name: { kind: "Name", value: "dataSourceType" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                            { kind: "Field", name: { kind: "Name", value: "label" } },
                            { kind: "Field", name: { kind: "Name", value: "public" } },
                            { kind: "Field", name: { kind: "Name", value: "category" } },
                            { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
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
} as unknown as DocumentNode<SearchCatalogQuery, SearchCatalogQueryVariables>;

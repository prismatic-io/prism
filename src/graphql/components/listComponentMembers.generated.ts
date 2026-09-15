/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type ActionBatchSupport = "INVALID" | "REQUIRED" | "VALID";

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

export type ActionScheduleSupport =
  /** Invalid */
  | "INVALID"
  /** Required */
  | "REQUIRED"
  /** Valid */
  | "VALID";

export type ActionSynchronousResponseSupport =
  /** Invalid */
  | "INVALID"
  /** Required */
  | "REQUIRED"
  /** Valid */
  | "VALID";

export type ListComponentMembersQueryVariables = Exact<{
  key: string;
  public?: boolean | null | undefined;
  versionNumber?: number | null | undefined;
  allVersions?: boolean | null | undefined;
  isTrigger?: boolean | null | undefined;
  isDataSource?: boolean | null | undefined;
  dataSourceType?: string | null | undefined;
  search?: string | null | undefined;
  after?: string | null | undefined;
  first?: number | null | undefined;
}>;

export type ListComponentMembersQuery = {
  components: {
    nodes: Array<{
      id: string;
      key: string;
      public: boolean;
      versionNumber: number;
      actions: {
        totalCount: number;
        nodes: Array<{
          id: string;
          key: string;
          label: string;
          description: string;
          important: boolean;
          isTrigger: boolean;
          isCommonTrigger: boolean | null;
          isPollingTrigger: boolean | null;
          scheduleSupport: Types.ActionScheduleSupport | null;
          synchronousResponseSupport: Types.ActionSynchronousResponseSupport | null;
          batchSupport: Types.ActionBatchSupport;
          isDataSource: boolean;
          dataSourceType: Types.ActionDataSourceType | null;
          isDetailDataSource: boolean;
          allowsBranching: boolean;
          terminateExecution: boolean;
          detailDataSource: { key: string } | null;
        }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>;
  };
};

export const ListComponentMembersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listComponentMembers" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "public" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTrigger" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isDataSource" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "dataSourceType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
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
                name: { kind: "Name", value: "key" },
                value: { kind: "Variable", name: { kind: "Name", value: "key" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "public" },
                value: { kind: "Variable", name: { kind: "Name", value: "public" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "versionNumber" },
                value: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "allVersions" },
                value: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
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
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "actions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isTrigger" },
                            value: { kind: "Variable", name: { kind: "Name", value: "isTrigger" } },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isDataSource" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "isDataSource" },
                            },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "dataSourceType" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "dataSourceType" },
                            },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "searchTerms_Fulltext" },
                            value: { kind: "Variable", name: { kind: "Name", value: "search" } },
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
                            { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "nodes" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  { kind: "Field", name: { kind: "Name", value: "label" } },
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "important" } },
                                  { kind: "Field", name: { kind: "Name", value: "isTrigger" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "isCommonTrigger" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "isPollingTrigger" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "scheduleSupport" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "synchronousResponseSupport" },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "batchSupport" } },
                                  { kind: "Field", name: { kind: "Name", value: "isDataSource" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "dataSourceType" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "isDetailDataSource" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "detailDataSource" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "key" } },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "allowsBranching" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "terminateExecution" },
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
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListComponentMembersQuery, ListComponentMembersQueryVariables>;

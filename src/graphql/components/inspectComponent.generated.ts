/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
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

export type ConnectionOauth2Type =
  /** Authorization Code */
  | "AUTHORIZATION_CODE"
  /** Client Credentials */
  | "CLIENT_CREDENTIALS";

export type CatalogMemberSummaryFragment = {
  id: string;
  key: string;
  label: string;
  description: string;
};

export type InspectComponentQueryVariables = Exact<{
  key: string;
  public?: boolean | null | undefined;
  versionNumber?: number | null | undefined;
  allVersions?: boolean | null | undefined;
}>;

export type InspectComponentQuery = {
  components: {
    nodes: Array<{
      id: string;
      key: string;
      label: string;
      description: string;
      public: boolean;
      category: string | null;
      documentationUrl: string | null;
      signature: string;
      labels: Array<string> | null;
      forCodeNativeIntegration: boolean;
      versionNumber: number;
      versionIsLatest: boolean;
      versionIsAvailable: boolean;
      versionCreatedAt: string | null;
      versionComment: string | null;
      customer: { id: string; name: string; externalId: string | null } | null;
      actions: {
        totalCount: number;
        nodes: Array<{ id: string; key: string; label: string; description: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
      triggers: {
        totalCount: number;
        nodes: Array<{ id: string; key: string; label: string; description: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
      dataSources: {
        totalCount: number;
        nodes: Array<{
          dataSourceType: Types.ActionDataSourceType | null;
          id: string;
          key: string;
          label: string;
          description: string;
        }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
      connections: {
        totalCount: number;
        nodes: Array<{
          id: string;
          key: string;
          label: string;
          default: boolean;
          oauth2Type: Types.ConnectionOauth2Type | null;
          onPremiseAvailable: boolean;
        }>;
      };
    }>;
  };
};

export const CatalogMemberSummaryFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CatalogMemberSummary" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Action" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "key" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CatalogMemberSummaryFragment, unknown>;
export const InspectComponentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "inspectComponent" },
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
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "public" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      { kind: "Field", name: { kind: "Name", value: "documentationUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "signature" } },
                      { kind: "Field", name: { kind: "Name", value: "labels" } },
                      { kind: "Field", name: { kind: "Name", value: "forCodeNativeIntegration" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "versionIsLatest" } },
                      { kind: "Field", name: { kind: "Name", value: "versionIsAvailable" } },
                      { kind: "Field", name: { kind: "Name", value: "versionCreatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "versionComment" } },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "actions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isTrigger" },
                            value: { kind: "BooleanValue", value: false },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isDataSource" },
                            value: { kind: "BooleanValue", value: false },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "first" },
                            value: { kind: "IntValue", value: "100" },
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
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "CatalogMemberSummary" },
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
                      {
                        kind: "Field",
                        alias: { kind: "Name", value: "triggers" },
                        name: { kind: "Name", value: "actions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isTrigger" },
                            value: { kind: "BooleanValue", value: true },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "first" },
                            value: { kind: "IntValue", value: "100" },
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
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "CatalogMemberSummary" },
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
                      {
                        kind: "Field",
                        alias: { kind: "Name", value: "dataSources" },
                        name: { kind: "Name", value: "actions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isDataSource" },
                            value: { kind: "BooleanValue", value: true },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "first" },
                            value: { kind: "IntValue", value: "100" },
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
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "CatalogMemberSummary" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "dataSourceType" },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connections" },
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
                                  { kind: "Field", name: { kind: "Name", value: "default" } },
                                  { kind: "Field", name: { kind: "Name", value: "oauth2Type" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "onPremiseAvailable" },
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
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CatalogMemberSummary" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Action" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "key" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<InspectComponentQuery, InspectComponentQueryVariables>;

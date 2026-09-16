/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ConnectionOauth2Type =
  /** Authorization Code */
  | "AUTHORIZATION_CODE"
  /** Client Credentials */
  | "CLIENT_CREDENTIALS";

export type InputFieldCollection =
  /** keyvaluelist */
  | "KEYVALUELIST"
  /** valuelist */
  | "VALUELIST";

export type InputFieldScope = "ON_DEPLOY";

export type InputFieldType =
  /** boolean */
  | "BOOLEAN"
  /** code */
  | "CODE"
  /** conditional */
  | "CONDITIONAL"
  /** connection */
  | "CONNECTION"
  /** data */
  | "DATA"
  /** date */
  | "DATE"
  /** dynamicFieldSelection */
  | "DYNAMICFIELDSELECTION"
  /** dynamicObject */
  | "DYNAMICOBJECT"
  /** dynamicObjectSelection */
  | "DYNAMICOBJECTSELECTION"
  /** flow */
  | "FLOW"
  /** jsonForm */
  | "JSONFORM"
  /** objectFieldMap */
  | "OBJECTFIELDMAP"
  /** objectSelection */
  | "OBJECTSELECTION"
  /** password */
  | "PASSWORD"
  /** string */
  | "STRING"
  /** structuredObject */
  | "STRUCTUREDOBJECT"
  /** template */
  | "TEMPLATE"
  /** text */
  | "TEXT"
  /** timestamp */
  | "TIMESTAMP";

export type ListComponentConnectionsQueryVariables = Exact<{
  key: string;
  public?: boolean | null | undefined;
  versionNumber?: number | null | undefined;
  allVersions?: boolean | null | undefined;
  connectionKey?: string | null | undefined;
  inputsAfter?: string | null | undefined;
}>;

export type ListComponentConnectionsQuery = {
  components: {
    nodes: Array<{
      id: string;
      key: string;
      label: string;
      public: boolean;
      versionNumber: number;
      connections: {
        nodes: Array<{
          id: string;
          key: string;
          label: string;
          default: boolean;
          order: number | null;
          comments: string | null;
          oauth2Type: Types.ConnectionOauth2Type | null;
          onPremiseAvailable: boolean;
          inputs: {
            nodes: Array<{
              id: string;
              key: string;
              keyPath: Array<string>;
              parentId: string | null;
              order: number | null;
              label: string;
              keyLabel: string | null;
              type: Types.InputFieldType;
              collection: Types.InputFieldCollection | null;
              required: boolean;
              shown: boolean;
              default: unknown;
              placeholder: string | null;
              comments: string | null;
              example: string | null;
              model: unknown;
              language: string | null;
              onPremiseControlled: boolean;
              scope: Types.InputFieldScope | null;
            }>;
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
          };
          templates: {
            nodes: Array<{
              id: string;
              name: string;
              templatedInputKeys: Array<string | null> | null;
            }>;
          };
        }>;
      };
    }>;
  };
};

export const ListComponentConnectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listComponentConnections" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "connectionKey" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "inputsAfter" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
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
                      { kind: "Field", name: { kind: "Name", value: "public" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connections" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "key" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "connectionKey" },
                            },
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
                                  value: { kind: "EnumValue", value: "ORDER" },
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
                                  { kind: "Field", name: { kind: "Name", value: "label" } },
                                  { kind: "Field", name: { kind: "Name", value: "default" } },
                                  { kind: "Field", name: { kind: "Name", value: "order" } },
                                  { kind: "Field", name: { kind: "Name", value: "comments" } },
                                  { kind: "Field", name: { kind: "Name", value: "oauth2Type" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "onPremiseAvailable" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "inputs" },
                                    arguments: [
                                      {
                                        kind: "Argument",
                                        name: { kind: "Name", value: "first" },
                                        value: { kind: "IntValue", value: "100" },
                                      },
                                      {
                                        kind: "Argument",
                                        name: { kind: "Name", value: "after" },
                                        value: {
                                          kind: "Variable",
                                          name: { kind: "Name", value: "inputsAfter" },
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
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "key" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "keyPath" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "parentId" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "order" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "label" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "keyLabel" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "collection" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "required" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "shown" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "default" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "placeholder" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "comments" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "example" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "model" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "language" },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "onPremiseControlled",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "scope" },
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
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "hasNextPage" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "endCursor" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "templates" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "nodes" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "templatedInputKeys" },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListComponentConnectionsQuery, ListComponentConnectionsQueryVariables>;

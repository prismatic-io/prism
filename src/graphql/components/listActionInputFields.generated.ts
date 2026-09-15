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

/**
 * Identifies a single Action by composite key. Action identity at the model
 * layer is `(tenant, component, key, is_trigger, is_data_source)` — the same
 * key can be reused across an action, a trigger, and a data source on the
 * same component, so the trigger/data-source flags are required to
 * disambiguate. Both default to False (the regular-action case).
 */
export type ActionInputFieldsSelector = {
  actionKey: string;
  componentKey: string;
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  componentPublic: boolean;
  /** The pinned version of the Component. Must be a concrete integer. */
  componentVersion: number;
  /** True when selecting a data source; defaults to False. */
  isDataSource?: boolean | null | undefined;
  /** True when selecting a trigger; defaults to False. */
  isTrigger?: boolean | null | undefined;
};

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

export type ListActionInputFieldsQueryVariables = Exact<{
  actions: Array<Types.ActionInputFieldsSelector> | Types.ActionInputFieldsSelector;
  after?: string | null | undefined;
  first?: number | null | undefined;
}>;

export type ListActionInputFieldsQuery = {
  actionInputFields: {
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
      action: { id: string; key: string } | null;
      dataSource: {
        key: string;
        label: string;
        dataSourceType: Types.ActionDataSourceType | null;
      } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const ListActionInputFieldsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listActionInputFields" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "actions" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "ActionInputFieldsSelector" },
                },
              },
            },
          },
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
            name: { kind: "Name", value: "actionInputFields" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "actions" },
                value: { kind: "Variable", name: { kind: "Name", value: "actions" } },
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
                      { kind: "Field", name: { kind: "Name", value: "keyPath" } },
                      { kind: "Field", name: { kind: "Name", value: "parentId" } },
                      { kind: "Field", name: { kind: "Name", value: "order" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "keyLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "collection" } },
                      { kind: "Field", name: { kind: "Name", value: "required" } },
                      { kind: "Field", name: { kind: "Name", value: "shown" } },
                      { kind: "Field", name: { kind: "Name", value: "default" } },
                      { kind: "Field", name: { kind: "Name", value: "placeholder" } },
                      { kind: "Field", name: { kind: "Name", value: "comments" } },
                      { kind: "Field", name: { kind: "Name", value: "example" } },
                      { kind: "Field", name: { kind: "Name", value: "model" } },
                      { kind: "Field", name: { kind: "Name", value: "language" } },
                      { kind: "Field", name: { kind: "Name", value: "onPremiseControlled" } },
                      { kind: "Field", name: { kind: "Name", value: "scope" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "action" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "dataSource" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                            { kind: "Field", name: { kind: "Name", value: "label" } },
                            { kind: "Field", name: { kind: "Name", value: "dataSourceType" } },
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
} as unknown as DocumentNode<ListActionInputFieldsQuery, ListActionInputFieldsQueryVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type FilterFieldDataType = "BOOLEAN" | "DATETIME" | "NUMBER" | "STRING";

export type FilterOperator =
  | "CONTAINS"
  | "EQ"
  | "GTE"
  | "IN"
  | "IS_NULL"
  | "LTE"
  | "NOT_EQ"
  | "STARTS_WITH";

export type ExecutionRunFilterFieldsQueryVariables = Exact<{
  integrationId?: string | number | null | undefined;
  customerId?: string | number | null | undefined;
  instanceId?: string | number | null | undefined;
  startedAtGte?: string | null | undefined;
  startedAtLte?: string | null | undefined;
  keySearch?: string | null | undefined;
}>;

export type ExecutionRunFilterFieldsQuery = {
  executionRunFilterFields: Array<{
    keyPath: string;
    dataType: Types.FilterFieldDataType;
    operators: Array<Types.FilterOperator>;
  }>;
};

export const ExecutionRunFilterFieldsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "executionRunFilterFields" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customerId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "instanceId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startedAtGte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "keySearch" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionRunFilterFields" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "integrationId" },
                value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "customerId" },
                value: { kind: "Variable", name: { kind: "Name", value: "customerId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instanceId" },
                value: { kind: "Variable", name: { kind: "Name", value: "instanceId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAtGte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtGte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAtLte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "keySearch" },
                value: { kind: "Variable", name: { kind: "Name", value: "keySearch" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "keyPath" } },
                { kind: "Field", name: { kind: "Name", value: "dataType" } },
                { kind: "Field", name: { kind: "Name", value: "operators" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExecutionRunFilterFieldsQuery, ExecutionRunFilterFieldsQueryVariables>;

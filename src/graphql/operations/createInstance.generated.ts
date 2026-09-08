/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type InputInstanceConfigVariable = {
  customerConfigVariableId?: string | number | null | undefined;
  /** The key of the Required Config Var of the Integration for which a value is being provided. */
  key: string;
  onPremiseResourceId?: string | number | null | undefined;
  /** The schedule type for the specified Required Config Var of the Integration. */
  scheduleType?: string | null | undefined;
  scopedConfigVariableId?: string | number | null | undefined;
  /** The timezone for the specified Required Config Var of the Integration. */
  timeZone?: string | null | undefined;
  /** The value to provide for the specified Required Config Var of the Integration. */
  value?: string | null | undefined;
  /** The values for nested inputs of the specified Required Config Var of the Integration. */
  values?: unknown;
};

export type CreateInstanceMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
  integration: string | number;
  customer: string | number;
  configVariables?:
    | Array<Types.InputInstanceConfigVariable | null | undefined>
    | Types.InputInstanceConfigVariable
    | null
    | undefined;
  labels?: Array<string | null | undefined> | string | null | undefined;
}>;

export type CreateInstanceMutation = {
  createInstance: {
    instance: { id: string } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const CreateInstanceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createInstance" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integration" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customer" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "configVariables" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "InputInstanceConfigVariable" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "labels" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createInstance" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integration" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integration" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "customer" },
                      value: { kind: "Variable", name: { kind: "Name", value: "customer" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "configVariables" },
                      value: { kind: "Variable", name: { kind: "Name", value: "configVariables" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "labels" },
                      value: { kind: "Variable", name: { kind: "Name", value: "labels" } },
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
                  name: { kind: "Name", value: "instance" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
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
} as unknown as DocumentNode<CreateInstanceMutation, CreateInstanceMutationVariables>;

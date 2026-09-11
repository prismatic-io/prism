/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type InstanceConfigVariableStatus =
  /** active */
  | "ACTIVE"
  /** error */
  | "ERROR"
  /** failed */
  | "FAILED"
  /** pending */
  | "PENDING";

export type RequiredConfigVariableDataType =
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

export type ListInstanceConfigVariablesQueryVariables = Exact<{
  id: string | number;
  after?: string | null | undefined;
  first?: number | null | undefined;
}>;

export type ListInstanceConfigVariablesQuery = {
  instance: {
    configVariables: {
      nodes: Array<{
        id: string;
        value: string | null;
        status: Types.InstanceConfigVariableStatus | null;
        inputs: { nodes: Array<{ name: string; value: string }> } | null;
        requiredConfigVariable: {
          id: string;
          key: string;
          defaultValue: string | null;
          dataType: Types.RequiredConfigVariableDataType;
        };
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export const ListInstanceConfigVariablesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listInstanceConfigVariables" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
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
            name: { kind: "Name", value: "instance" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "configVariables" },
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
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                            { kind: "Field", name: { kind: "Name", value: "status" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "inputs" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "nodes" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                        { kind: "Field", name: { kind: "Name", value: "value" } },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "requiredConfigVariable" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  { kind: "Field", name: { kind: "Name", value: "defaultValue" } },
                                  { kind: "Field", name: { kind: "Name", value: "dataType" } },
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
      },
    },
  ],
} as unknown as DocumentNode<
  ListInstanceConfigVariablesQuery,
  ListInstanceConfigVariablesQueryVariables
>;

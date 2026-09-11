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

export type StateQueryVariables = Exact<{
  integrationId: string | number;
}>;

export type StateQuery = {
  integration: {
    testConfigVariables: {
      nodes: Array<{ id: string; status: Types.InstanceConfigVariableStatus | null }>;
    };
  } | null;
};

export const StateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "state" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "integration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "testConfigVariables" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "status_In" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "StringValue", value: "pending", block: false },
                          { kind: "StringValue", value: "active", block: false },
                          { kind: "StringValue", value: "error", block: false },
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
                            { kind: "Field", name: { kind: "Name", value: "status" } },
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
} as unknown as DocumentNode<StateQuery, StateQueryVariables>;

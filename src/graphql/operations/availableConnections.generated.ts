/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ScopedConfigVariableManagedBy =
  /** Customer */
  | "CUSTOMER"
  /** Org */
  | "ORG"
  /** System */
  | "SYSTEM"
  /** User */
  | "USER";

export type AvailableConnectionsQueryVariables = Exact<{
  managedBy?: string | null | undefined;
}>;

export type AvailableConnectionsQuery = {
  scopedConfigVariables: {
    nodes: Array<{
      stableKey: string;
      description: string | null;
      managedBy: Types.ScopedConfigVariableManagedBy;
      customer: { externalId: string | null; name: string } | null;
      connection: { component: { key: string } } | null;
    }>;
  };
};

export const AvailableConnectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "availableConnections" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "managedBy" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scopedConfigVariables" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "managedBy" },
                value: { kind: "Variable", name: { kind: "Name", value: "managedBy" } },
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
                      { kind: "Field", name: { kind: "Name", value: "stableKey" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "managedBy" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "customer" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "externalId" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "component" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
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
} as unknown as DocumentNode<AvailableConnectionsQuery, AvailableConnectionsQueryVariables>;

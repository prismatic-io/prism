/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type InstanceQueryVariables = Exact<{
  id: string | number;
}>;

export type InstanceQuery = {
  instance: {
    configVariables: {
      nodes: Array<{
        meta: unknown;
        requiredConfigVariable: {
          key: string;
          connectionTemplate: {
            inputFieldTemplates: {
              nodes: Array<{ value: string | null; inputField: { key: string } }>;
            };
          } | null;
        };
        inputs: { nodes: Array<{ name: string; value: string }> } | null;
      }>;
    };
  } | null;
};

export const InstanceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "instance" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
                              name: { kind: "Name", value: "requiredConfigVariable" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "connectionTemplate" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "inputFieldTemplates" },
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
                                                      name: { kind: "Name", value: "inputField" },
                                                      selectionSet: {
                                                        kind: "SelectionSet",
                                                        selections: [
                                                          {
                                                            kind: "Field",
                                                            name: { kind: "Name", value: "key" },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "value" },
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
                            { kind: "Field", name: { kind: "Name", value: "meta" } },
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
} as unknown as DocumentNode<InstanceQuery, InstanceQueryVariables>;

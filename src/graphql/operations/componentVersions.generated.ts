/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ComponentVersionsQueryVariables = Exact<{
  key: string;
  public: boolean;
  signature?: string | null;
  allVersions?: boolean | null;
}>;

export type ComponentVersionsQuery = {
  components: {
    nodes: Array<{
      id: string;
      signature: string;
      versionNumber: number;
      versionIsAvailable: boolean;
    }>;
  };
};

export const ComponentVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: "componentVersions",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: {
              kind: "Name",
              value: "key",
            },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: {
                kind: "Name",
                value: "String",
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: {
              kind: "Name",
              value: "public",
            },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: {
                kind: "Name",
                value: "Boolean",
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: {
              kind: "Name",
              value: "signature",
            },
          },
          type: {
            kind: "NamedType",
            name: {
              kind: "Name",
              value: "String",
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: {
              kind: "Name",
              value: "allVersions",
            },
          },
          type: {
            kind: "NamedType",
            name: {
              kind: "Name",
              value: "Boolean",
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "components",
            },
            arguments: [
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "key",
                },
                value: {
                  kind: "Variable",
                  name: {
                    kind: "Name",
                    value: "key",
                  },
                },
              },
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "public",
                },
                value: {
                  kind: "Variable",
                  name: {
                    kind: "Name",
                    value: "public",
                  },
                },
              },
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "signature",
                },
                value: {
                  kind: "Variable",
                  name: {
                    kind: "Name",
                    value: "signature",
                  },
                },
              },
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "allVersions",
                },
                value: {
                  kind: "Variable",
                  name: {
                    kind: "Name",
                    value: "allVersions",
                  },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: {
                    kind: "Name",
                    value: "nodes",
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "id",
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "signature",
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "versionNumber",
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "versionIsAvailable",
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
} as unknown as DocumentNode<ComponentVersionsQuery, ComponentVersionsQueryVariables>;

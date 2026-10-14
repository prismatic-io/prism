/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ListIntegrationVersionsQueryVariables = Exact<{
  integrationId: string | number;
  onlyAvailable?: boolean | null | undefined;
  onlyShowOne?: number | null | undefined;
}>;

export type ListIntegrationVersionsQuery = {
  integration: {
    versionSequence: {
      nodes: Array<{
        id: string;
        versionNumber: number;
        versionCreatedAt: string | null;
        versionComment: string | null;
        versionIsAvailable: boolean;
        versionCreatedBy: { email: string } | null;
      }>;
    };
  } | null;
};

export const ListIntegrationVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listIntegrationVersions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "onlyAvailable" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "onlyShowOne" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
                  name: { kind: "Name", value: "versionSequence" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "versionIsAvailable" },
                      value: { kind: "Variable", name: { kind: "Name", value: "onlyAvailable" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sortBy" },
                      value: {
                        kind: "ListValue",
                        values: [
                          {
                            kind: "ObjectValue",
                            fields: [
                              {
                                kind: "ObjectField",
                                name: { kind: "Name", value: "field" },
                                value: { kind: "EnumValue", value: "VERSION_NUMBER" },
                              },
                              {
                                kind: "ObjectField",
                                name: { kind: "Name", value: "direction" },
                                value: { kind: "EnumValue", value: "DESC" },
                              },
                            ],
                          },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "Variable", name: { kind: "Name", value: "onlyShowOne" } },
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
                            { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                            { kind: "Field", name: { kind: "Name", value: "versionCreatedAt" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "versionCreatedBy" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "email" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "versionComment" } },
                            { kind: "Field", name: { kind: "Name", value: "versionIsAvailable" } },
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
} as unknown as DocumentNode<ListIntegrationVersionsQuery, ListIntegrationVersionsQueryVariables>;

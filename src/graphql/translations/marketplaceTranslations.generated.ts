/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type IntegrationTranslationFragment = {
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  overview: string | null;
  configPages: unknown;
  requiredConfigVariables: {
    nodes: Array<{
      key: string;
      description: string | null;
      inputs: { nodes: Array<{ name: string; meta: unknown }> } | null;
    }>;
  };
};

export type MarketplaceTranslationsQueryVariables = Exact<{ [key: string]: never }>;

export type MarketplaceTranslationsQuery = {
  marketplaceIntegrations: {
    nodes: Array<{
      id: string;
      name: string;
      description: string | null;
      definition: string | null;
      category: string | null;
      overview: string | null;
      configPages: unknown;
      instances: {
        nodes: Array<{
          id: string;
          name: string;
          integration: {
            name: string;
            description: string | null;
            definition: string | null;
            category: string | null;
            overview: string | null;
            configPages: unknown;
            requiredConfigVariables: {
              nodes: Array<{
                key: string;
                description: string | null;
                inputs: { nodes: Array<{ name: string; meta: unknown }> } | null;
              }>;
            };
          };
        }>;
      };
      requiredConfigVariables: {
        nodes: Array<{
          key: string;
          description: string | null;
          inputs: { nodes: Array<{ name: string; meta: unknown }> } | null;
        }>;
      };
    }>;
  };
};

export const IntegrationTranslationFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "IntegrationTranslation" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Integration" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "definition" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "overview" } },
          { kind: "Field", name: { kind: "Name", value: "configPages" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "requiredConfigVariables" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
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
      },
    },
  ],
} as unknown as DocumentNode<IntegrationTranslationFragment, unknown>;
export const MarketplaceTranslationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MarketplaceTranslations" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "marketplaceIntegrations" },
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
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "IntegrationTranslation" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "instances" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isSystem" },
                            value: { kind: "BooleanValue", value: false },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "integration" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "FragmentSpread",
                                          name: { kind: "Name", value: "IntegrationTranslation" },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "IntegrationTranslation" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Integration" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "definition" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "overview" } },
          { kind: "Field", name: { kind: "Name", value: "configPages" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "requiredConfigVariables" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
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
      },
    },
  ],
} as unknown as DocumentNode<MarketplaceTranslationsQuery, MarketplaceTranslationsQueryVariables>;

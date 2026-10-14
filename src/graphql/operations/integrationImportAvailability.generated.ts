/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type IntegrationImportAvailabilityQueryVariables = Exact<{
  integrationId: string | number;
}>;

export type IntegrationImportAvailabilityQuery = {
  __typename?: "RootQuery";
  integration?: {
    __typename?: "Integration";
    versionNumber: number;
    systemInstance: {
      __typename?: "Instance";
      lastDeployedAt?: string | null;
      deployedVersion: number;
      needsDeploy: boolean;
    };
  } | null;
};

export const IntegrationImportAvailabilityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "integrationImportAvailability" },
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
                { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "systemInstance" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "lastDeployedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "deployedVersion" } },
                      { kind: "Field", name: { kind: "Name", value: "needsDeploy" } },
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
  IntegrationImportAvailabilityQuery,
  IntegrationImportAvailabilityQueryVariables
>;

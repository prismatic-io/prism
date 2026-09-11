/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type InstanceConfigState =
  | "FULLY_CONFIGURED"
  | "NEEDS_INSTANCE_CONFIGURATION"
  | "NEEDS_USER_LEVEL_CONFIGURATION";

export type GetIntegrationSystemInstanceQueryVariables = Exact<{
  integrationId: string | number;
}>;

export type GetIntegrationSystemInstanceQuery = {
  integration: {
    isCodeNative: boolean;
    systemInstance: { id: string; configState: Types.InstanceConfigState | null };
  } | null;
};

export const GetIntegrationSystemInstanceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetIntegrationSystemInstance" },
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
                { kind: "Field", name: { kind: "Name", value: "isCodeNative" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "systemInstance" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "configState" } },
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
  GetIntegrationSystemInstanceQuery,
  GetIntegrationSystemInstanceQueryVariables
>;

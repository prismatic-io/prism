/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type InputInstanceFlowConfig = {
  apiKeys?: Array<string | null | undefined> | null | undefined;
  flowId: string | number;
  /** Content type of the payload for testing this IntegrationFlow associated with the Instance. */
  testContentType?: string | null | undefined;
  /** Headers of the request for testing this IntegrationFlow associated with the Instance. */
  testHeaders?: unknown;
  /** Data payload for testing this IntegrationFlow associated with the Instance. */
  testPayload?: string | null | undefined;
  /** Specifies whether executions of this InstanceFlowConfig will use Long Running Executions. */
  usesLre?: boolean | null | undefined;
};

export type SetInstanceApiKeysMutationVariables = Exact<{
  instanceId: string | number;
  flowConfigs?:
    | Array<Types.InputInstanceFlowConfig | null | undefined>
    | Types.InputInstanceFlowConfig
    | null
    | undefined;
}>;

export type SetInstanceApiKeysMutation = {
  updateInstance: {
    instance: {
      id: string;
      flowConfigs: {
        nodes: Array<{ id: string; apiKeys: Array<string | null> | null; flow: { id: string } }>;
      };
    } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const SetInstanceApiKeysDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "setInstanceApiKeys" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "instanceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "flowConfigs" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "InputInstanceFlowConfig" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateInstance" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "instanceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "flowConfigs" },
                      value: { kind: "Variable", name: { kind: "Name", value: "flowConfigs" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "configMode" },
                      value: { kind: "StringValue", value: "INSTANCE", block: false },
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
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "flowConfigs" },
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
                                  { kind: "Field", name: { kind: "Name", value: "apiKeys" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "flow" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
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
} as unknown as DocumentNode<SetInstanceApiKeysMutation, SetInstanceApiKeysMutationVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type ActionBatchSupport = "INVALID" | "REQUIRED" | "VALID";

export type ActionDataSourceType =
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

export type ActionScheduleSupport =
  /** Invalid */
  | "INVALID"
  /** Required */
  | "REQUIRED"
  /** Valid */
  | "VALID";

export type ActionSynchronousResponseSupport =
  /** Invalid */
  | "INVALID"
  /** Required */
  | "REQUIRED"
  /** Valid */
  | "VALID";

export type CatalogMemberDetailFragment = {
  id: string;
  key: string;
  label: string;
  description: string;
  directions: string | null;
  important: boolean;
  authorizationRequired: boolean | null;
  isTrigger: boolean;
  isCommonTrigger: boolean | null;
  isPollingTrigger: boolean | null;
  scheduleSupport: Types.ActionScheduleSupport | null;
  synchronousResponseSupport: Types.ActionSynchronousResponseSupport | null;
  batchSupport: Types.ActionBatchSupport;
  defaultBatchSize: number | null;
  hasOnDeployPerform: boolean;
  hasOnInstanceDeploy: boolean;
  hasOnInstanceDelete: boolean;
  hasWebhookCreateFunction: boolean;
  hasWebhookDeleteFunction: boolean;
  isDataSource: boolean;
  dataSourceType: Types.ActionDataSourceType | null;
  isDetailDataSource: boolean;
  allowsBranching: boolean;
  staticBranchNames: Array<string> | null;
  dynamicBranchInput: string;
  terminateExecution: boolean;
  breakLoop: boolean | null;
  canCallComponentFunctions: boolean;
  examplePayload: unknown;
  outputSchema:
    | { __typename: "ActionOutputSchema"; type: string; schema: string }
    | {
        __typename: "BranchingOutputSchema";
        type: string;
        branchSchemas: Array<{ name: string; schema: string }>;
      }
    | null;
};

export type GetComponentMemberQueryVariables = Exact<{
  key: string;
  public?: boolean | null | undefined;
  versionNumber?: number | null | undefined;
  allVersions?: boolean | null | undefined;
  memberKey: string;
  isTrigger: boolean;
  isDataSource: boolean;
}>;

export type GetComponentMemberQuery = {
  components: {
    nodes: Array<{
      id: string;
      key: string;
      label: string;
      public: boolean;
      versionNumber: number;
      actions: {
        nodes: Array<{
          id: string;
          key: string;
          label: string;
          description: string;
          directions: string | null;
          important: boolean;
          authorizationRequired: boolean | null;
          isTrigger: boolean;
          isCommonTrigger: boolean | null;
          isPollingTrigger: boolean | null;
          scheduleSupport: Types.ActionScheduleSupport | null;
          synchronousResponseSupport: Types.ActionSynchronousResponseSupport | null;
          batchSupport: Types.ActionBatchSupport;
          defaultBatchSize: number | null;
          hasOnDeployPerform: boolean;
          hasOnInstanceDeploy: boolean;
          hasOnInstanceDelete: boolean;
          hasWebhookCreateFunction: boolean;
          hasWebhookDeleteFunction: boolean;
          isDataSource: boolean;
          dataSourceType: Types.ActionDataSourceType | null;
          isDetailDataSource: boolean;
          allowsBranching: boolean;
          staticBranchNames: Array<string> | null;
          dynamicBranchInput: string;
          terminateExecution: boolean;
          breakLoop: boolean | null;
          canCallComponentFunctions: boolean;
          examplePayload: unknown;
          detailDataSource: {
            id: string;
            key: string;
            label: string;
            description: string;
            directions: string | null;
            important: boolean;
            authorizationRequired: boolean | null;
            isTrigger: boolean;
            isCommonTrigger: boolean | null;
            isPollingTrigger: boolean | null;
            scheduleSupport: Types.ActionScheduleSupport | null;
            synchronousResponseSupport: Types.ActionSynchronousResponseSupport | null;
            batchSupport: Types.ActionBatchSupport;
            defaultBatchSize: number | null;
            hasOnDeployPerform: boolean;
            hasOnInstanceDeploy: boolean;
            hasOnInstanceDelete: boolean;
            hasWebhookCreateFunction: boolean;
            hasWebhookDeleteFunction: boolean;
            isDataSource: boolean;
            dataSourceType: Types.ActionDataSourceType | null;
            isDetailDataSource: boolean;
            allowsBranching: boolean;
            staticBranchNames: Array<string> | null;
            dynamicBranchInput: string;
            terminateExecution: boolean;
            breakLoop: boolean | null;
            canCallComponentFunctions: boolean;
            examplePayload: unknown;
            outputSchema:
              | { __typename: "ActionOutputSchema"; type: string; schema: string }
              | {
                  __typename: "BranchingOutputSchema";
                  type: string;
                  branchSchemas: Array<{ name: string; schema: string }>;
                }
              | null;
          } | null;
          outputSchema:
            | { __typename: "ActionOutputSchema"; type: string; schema: string }
            | {
                __typename: "BranchingOutputSchema";
                type: string;
                branchSchemas: Array<{ name: string; schema: string }>;
              }
            | null;
        }>;
      };
    }>;
  };
};

export const CatalogMemberDetailFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CatalogMemberDetail" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Action" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "key" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "directions" } },
          { kind: "Field", name: { kind: "Name", value: "important" } },
          { kind: "Field", name: { kind: "Name", value: "authorizationRequired" } },
          { kind: "Field", name: { kind: "Name", value: "isTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "isCommonTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "isPollingTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "scheduleSupport" } },
          { kind: "Field", name: { kind: "Name", value: "synchronousResponseSupport" } },
          { kind: "Field", name: { kind: "Name", value: "batchSupport" } },
          { kind: "Field", name: { kind: "Name", value: "defaultBatchSize" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnDeployPerform" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnInstanceDeploy" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnInstanceDelete" } },
          { kind: "Field", name: { kind: "Name", value: "hasWebhookCreateFunction" } },
          { kind: "Field", name: { kind: "Name", value: "hasWebhookDeleteFunction" } },
          { kind: "Field", name: { kind: "Name", value: "isDataSource" } },
          { kind: "Field", name: { kind: "Name", value: "dataSourceType" } },
          { kind: "Field", name: { kind: "Name", value: "isDetailDataSource" } },
          { kind: "Field", name: { kind: "Name", value: "allowsBranching" } },
          { kind: "Field", name: { kind: "Name", value: "staticBranchNames" } },
          { kind: "Field", name: { kind: "Name", value: "dynamicBranchInput" } },
          { kind: "Field", name: { kind: "Name", value: "terminateExecution" } },
          { kind: "Field", name: { kind: "Name", value: "breakLoop" } },
          { kind: "Field", name: { kind: "Name", value: "canCallComponentFunctions" } },
          { kind: "Field", name: { kind: "Name", value: "examplePayload" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "outputSchema" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "ActionOutputSchema" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "schema" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "BranchingOutputSchema" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "branchSchemas" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "schema" } },
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
} as unknown as DocumentNode<CatalogMemberDetailFragment, unknown>;
export const GetComponentMemberDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getComponentMember" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "public" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "memberKey" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTrigger" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isDataSource" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "components" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "key" },
                value: { kind: "Variable", name: { kind: "Name", value: "key" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "public" },
                value: { kind: "Variable", name: { kind: "Name", value: "public" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "versionNumber" },
                value: { kind: "Variable", name: { kind: "Name", value: "versionNumber" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "allVersions" },
                value: { kind: "Variable", name: { kind: "Name", value: "allVersions" } },
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
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "public" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "actions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "key" },
                            value: { kind: "Variable", name: { kind: "Name", value: "memberKey" } },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isTrigger" },
                            value: { kind: "Variable", name: { kind: "Name", value: "isTrigger" } },
                          },
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "isDataSource" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "isDataSource" },
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
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "CatalogMemberDetail" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "detailDataSource" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "FragmentSpread",
                                          name: { kind: "Name", value: "CatalogMemberDetail" },
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
      name: { kind: "Name", value: "CatalogMemberDetail" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Action" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "key" } },
          { kind: "Field", name: { kind: "Name", value: "label" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "directions" } },
          { kind: "Field", name: { kind: "Name", value: "important" } },
          { kind: "Field", name: { kind: "Name", value: "authorizationRequired" } },
          { kind: "Field", name: { kind: "Name", value: "isTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "isCommonTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "isPollingTrigger" } },
          { kind: "Field", name: { kind: "Name", value: "scheduleSupport" } },
          { kind: "Field", name: { kind: "Name", value: "synchronousResponseSupport" } },
          { kind: "Field", name: { kind: "Name", value: "batchSupport" } },
          { kind: "Field", name: { kind: "Name", value: "defaultBatchSize" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnDeployPerform" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnInstanceDeploy" } },
          { kind: "Field", name: { kind: "Name", value: "hasOnInstanceDelete" } },
          { kind: "Field", name: { kind: "Name", value: "hasWebhookCreateFunction" } },
          { kind: "Field", name: { kind: "Name", value: "hasWebhookDeleteFunction" } },
          { kind: "Field", name: { kind: "Name", value: "isDataSource" } },
          { kind: "Field", name: { kind: "Name", value: "dataSourceType" } },
          { kind: "Field", name: { kind: "Name", value: "isDetailDataSource" } },
          { kind: "Field", name: { kind: "Name", value: "allowsBranching" } },
          { kind: "Field", name: { kind: "Name", value: "staticBranchNames" } },
          { kind: "Field", name: { kind: "Name", value: "dynamicBranchInput" } },
          { kind: "Field", name: { kind: "Name", value: "terminateExecution" } },
          { kind: "Field", name: { kind: "Name", value: "breakLoop" } },
          { kind: "Field", name: { kind: "Name", value: "canCallComponentFunctions" } },
          { kind: "Field", name: { kind: "Name", value: "examplePayload" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "outputSchema" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "ActionOutputSchema" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "schema" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "BranchingOutputSchema" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "branchSchemas" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "schema" } },
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
} as unknown as DocumentNode<GetComponentMemberQuery, GetComponentMemberQueryVariables>;

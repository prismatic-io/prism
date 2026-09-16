/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type ExecutionStatus = "CANCELED" | "CANCELING" | "ERROR" | "PENDING" | "QUEUED" | "SUCCESS";

export type InstanceExecutionResultInvokeType =
  /** AI Agent */
  | "AI_AGENT"
  /** Cross Flow */
  | "CROSS_FLOW"
  /** Deploy Flow */
  | "DEPLOY_FLOW"
  /** Instance Sync Flow */
  | "INSTANCE_SYNC_FLOW"
  /** Integration Endpoint Test */
  | "INTEGRATION_ENDPOINT_TEST"
  /** Integration Flow Test */
  | "INTEGRATION_FLOW_TEST"
  /** Scheduled */
  | "SCHEDULED"
  /** Tear Down Flow */
  | "TEAR_DOWN_FLOW"
  /** Webhook */
  | "WEBHOOK"
  /** Webhook Snapshot */
  | "WEBHOOK_SNAPSHOT";

/** Allows specifying which field and direction to order by. */
export type InstanceExecutionResultOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceExecutionResultOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export type InstanceExecutionResultOrderField = "ENDED_AT" | "STARTED_AT";

export type InstanceExecutionResultResultType =
  /** Canceled As Duplicate */
  | "CANCELED_AS_DUPLICATE"
  /** Canceled By User */
  | "CANCELED_BY_USER"
  /** Completed */
  | "COMPLETED"
  /** Error */
  | "ERROR"
  /** Polled No Changes */
  | "POLLED_NO_CHANGES";

/** Indicates what kind of Instance, if any, is related to this record. */
export type InstanceType = "INTEGRATION" | "WORKFLOW";

/** Represents the supported sort order directions. */
export type OrderDirection = "ASC" | "DESC";

export type LegacyExecutionRowFragment = {
  id: string;
  status: Types.ExecutionStatus;
  resultType: Types.InstanceExecutionResultResultType | null;
  invokeType: Types.InstanceExecutionResultInvokeType | null;
  startedAt: string;
  endedAt: string | null;
  queuedAt: string | null;
  resumedAt: string | null;
  stepCount: number | null;
  error: string | null;
  isTestExecution: boolean;
  retryCount: number | null;
  allowUpdate: boolean;
  retryForExecution: { id: string } | null;
  replayForExecution: { id: string } | null;
  instance: {
    id: string;
    name: string;
    customer: { id: string; name: string; externalId: string | null };
  } | null;
  integration: { id: string; name: string } | null;
  flow: { id: string; name: string } | null;
};

export type LegacyExecutionResultsQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  startedAtGte?: string | null | undefined;
  startedAtLte?: string | null | undefined;
  id?: string | number | null | undefined;
  instance?: string | number | null | undefined;
  customer?: string | number | null | undefined;
  integration?: string | number | null | undefined;
  flow?: string | number | null | undefined;
  status?: Types.ExecutionStatus | null | undefined;
  resultTypes?: Array<string | null | undefined> | string | null | undefined;
  invokeTypes?: Array<string | null | undefined> | string | null | undefined;
  isTestExecution?: boolean | null | undefined;
  instanceType?: Types.InstanceType | null | undefined;
  integrationVersionSequenceId?: string | null | undefined;
  endedAtIsNull?: boolean | null | undefined;
  errorIsNull?: boolean | null | undefined;
  retryForExecutionIsNull?: boolean | null | undefined;
  orderBy?: Types.InstanceExecutionResultOrder | null | undefined;
}>;

export type LegacyExecutionResultsQuery = {
  executionResults: {
    totalCount: number;
    nodes: Array<{
      id: string;
      status: Types.ExecutionStatus;
      resultType: Types.InstanceExecutionResultResultType | null;
      invokeType: Types.InstanceExecutionResultInvokeType | null;
      startedAt: string;
      endedAt: string | null;
      queuedAt: string | null;
      resumedAt: string | null;
      stepCount: number | null;
      error: string | null;
      isTestExecution: boolean;
      retryCount: number | null;
      allowUpdate: boolean;
      retryForExecution: { id: string } | null;
      replayForExecution: { id: string } | null;
      instance: {
        id: string;
        name: string;
        customer: { id: string; name: string; externalId: string | null };
      } | null;
      integration: { id: string; name: string } | null;
      flow: { id: string; name: string } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const LegacyExecutionRowFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "LegacyExecutionRow" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "InstanceExecutionResult" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "resultType" } },
          { kind: "Field", name: { kind: "Name", value: "invokeType" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "endedAt" } },
          { kind: "Field", name: { kind: "Name", value: "queuedAt" } },
          { kind: "Field", name: { kind: "Name", value: "resumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "stepCount" } },
          { kind: "Field", name: { kind: "Name", value: "error" } },
          { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
          { kind: "Field", name: { kind: "Name", value: "retryCount" } },
          { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "retryForExecution" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replayForExecution" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "instance" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "customer" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "externalId" } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "integration" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "flow" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LegacyExecutionRowFragment, unknown>;
export const LegacyExecutionResultsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "legacyExecutionResults" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "first" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "after" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startedAtGte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "instance" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integration" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "flow" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "status" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ExecutionStatus" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "resultTypes" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "invokeTypes" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTestExecution" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "instanceType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "InstanceType" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "integrationVersionSequenceId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "endedAtIsNull" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "errorIsNull" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "retryForExecutionIsNull" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "orderBy" } },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "InstanceExecutionResultOrder" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionResults" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "first" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: { kind: "Variable", name: { kind: "Name", value: "after" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAt_Gte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtGte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAt_Lte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instance" },
                value: { kind: "Variable", name: { kind: "Name", value: "instance" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instance_Customer" },
                value: { kind: "Variable", name: { kind: "Name", value: "customer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instance_Integration" },
                value: { kind: "Variable", name: { kind: "Name", value: "integration" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "flowConfig_Flow" },
                value: { kind: "Variable", name: { kind: "Name", value: "flow" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: { kind: "Variable", name: { kind: "Name", value: "status" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "resultType_In" },
                value: { kind: "Variable", name: { kind: "Name", value: "resultTypes" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "invokeType_In" },
                value: { kind: "Variable", name: { kind: "Name", value: "invokeTypes" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "isTestExecution" },
                value: { kind: "Variable", name: { kind: "Name", value: "isTestExecution" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instanceType" },
                value: { kind: "Variable", name: { kind: "Name", value: "instanceType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "integration_VersionSequenceId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "integrationVersionSequenceId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "endedAt_Isnull" },
                value: { kind: "Variable", name: { kind: "Name", value: "endedAtIsNull" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "error_Isnull" },
                value: { kind: "Variable", name: { kind: "Name", value: "errorIsNull" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "retryForExecution_Isnull" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "retryForExecutionIsNull" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: { kind: "Variable", name: { kind: "Name", value: "orderBy" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "LegacyExecutionRow" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
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
      name: { kind: "Name", value: "LegacyExecutionRow" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "InstanceExecutionResult" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "resultType" } },
          { kind: "Field", name: { kind: "Name", value: "invokeType" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "endedAt" } },
          { kind: "Field", name: { kind: "Name", value: "queuedAt" } },
          { kind: "Field", name: { kind: "Name", value: "resumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "stepCount" } },
          { kind: "Field", name: { kind: "Name", value: "error" } },
          { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
          { kind: "Field", name: { kind: "Name", value: "retryCount" } },
          { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "retryForExecution" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replayForExecution" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "instance" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "customer" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "externalId" } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "integration" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "flow" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LegacyExecutionResultsQuery, LegacyExecutionResultsQueryVariables>;

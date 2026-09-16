/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type EventFilterGroup = {
  filters: Array<EventFilterInput>;
  /** Nested filter groups combined under this group's operator. */
  groups?: Array<EventFilterGroup> | null | undefined;
  operator: LogicalOperator;
};

export type EventFilterInput = {
  keyPath: string;
  operator: FilterOperator;
  value?: unknown;
};

export type ExecutionRunInvokeType =
  | "AI_AGENT"
  | "CROSS_FLOW"
  | "DEPLOY_FLOW"
  | "INSTANCE_SYNC_FLOW"
  | "INTEGRATION_ENDPOINT_TEST"
  | "INTEGRATION_FLOW_TEST"
  | "SCHEDULED"
  | "TEAR_DOWN_FLOW"
  | "WEBHOOK"
  | "WEBHOOK_SNAPSHOT";

export type ExecutionRunOrder = {
  direction: OrderDirection;
  field: ExecutionRunOrderField;
};

export type ExecutionRunOrderField =
  | "CUSTOMER_NAME"
  | "DURATION_MS"
  | "ENDED_AT"
  | "ERROR_STEP_NAME"
  | "FLOW_NAME"
  | "INSTANCE_NAME"
  | "INTEGRATION_NAME"
  | "INVOKE_TYPE"
  | "QUEUED_AT"
  | "RESULT_TYPE"
  | "RESUMED_AT"
  | "STARTED_AT"
  | "STATUS"
  | "STEP_COUNT";

export type ExecutionRunResultType =
  | "CANCELED_AS_DUPLICATE"
  | "CANCELED_BY_USER"
  | "COMPLETED"
  | "ERROR"
  | "POLLED_NO_CHANGES";

export type ExecutionStatus = "CANCELED" | "CANCELING" | "ERROR" | "PENDING" | "QUEUED" | "SUCCESS";

export type FilterOperator =
  | "CONTAINS"
  | "EQ"
  | "GTE"
  | "IN"
  | "IS_NULL"
  | "LTE"
  | "NOT_EQ"
  | "STARTS_WITH";

export type LogicalOperator = "AND" | "OR";

/** Represents the supported sort order directions. */
export type OrderDirection = "ASC" | "DESC";

export type ExecutionRunRowFragment = {
  id: string;
  status: Types.ExecutionStatus;
  resultType: Types.ExecutionRunResultType | null;
  invokeType: Types.ExecutionRunInvokeType | null;
  startedAt: string;
  endedAt: string | null;
  queuedAt: string | null;
  resumedAt: string | null;
  durationMs: number | null;
  stepCount: number | null;
  error: string | null;
  errorStepName: string | null;
  instanceId: string | null;
  instanceName: string | null;
  customerId: string | null;
  customerName: string | null;
  customerExternalId: string | null;
  integrationId: string | null;
  integrationName: string | null;
  flowId: string | null;
  flowName: string | null;
  isTestExecution: boolean | null;
  isReplay: boolean | null;
  retryAttemptNumber: number | null;
  retryForExecutionId: string | null;
  allowUpdate: boolean;
};

export type SearchExecutionRunsQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  startedAtGte: string;
  startedAtLte: string;
  filterGroups?: Array<Types.EventFilterGroup> | Types.EventFilterGroup | null | undefined;
  orderBy?: Types.ExecutionRunOrder | null | undefined;
}>;

export type SearchExecutionRunsQuery = {
  executionRuns: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        status: Types.ExecutionStatus;
        resultType: Types.ExecutionRunResultType | null;
        invokeType: Types.ExecutionRunInvokeType | null;
        startedAt: string;
        endedAt: string | null;
        queuedAt: string | null;
        resumedAt: string | null;
        durationMs: number | null;
        stepCount: number | null;
        error: string | null;
        errorStepName: string | null;
        instanceId: string | null;
        instanceName: string | null;
        customerId: string | null;
        customerName: string | null;
        customerExternalId: string | null;
        integrationId: string | null;
        integrationName: string | null;
        flowId: string | null;
        flowName: string | null;
        isTestExecution: boolean | null;
        isReplay: boolean | null;
        retryAttemptNumber: number | null;
        retryForExecutionId: string | null;
        allowUpdate: boolean;
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const ExecutionRunRowFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExecutionRunRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ExecutionRun" } },
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
          { kind: "Field", name: { kind: "Name", value: "durationMs" } },
          { kind: "Field", name: { kind: "Name", value: "stepCount" } },
          { kind: "Field", name: { kind: "Name", value: "error" } },
          { kind: "Field", name: { kind: "Name", value: "errorStepName" } },
          { kind: "Field", name: { kind: "Name", value: "instanceId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceName" } },
          { kind: "Field", name: { kind: "Name", value: "customerId" } },
          { kind: "Field", name: { kind: "Name", value: "customerName" } },
          { kind: "Field", name: { kind: "Name", value: "customerExternalId" } },
          { kind: "Field", name: { kind: "Name", value: "integrationId" } },
          { kind: "Field", name: { kind: "Name", value: "integrationName" } },
          { kind: "Field", name: { kind: "Name", value: "flowId" } },
          { kind: "Field", name: { kind: "Name", value: "flowName" } },
          { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
          { kind: "Field", name: { kind: "Name", value: "isReplay" } },
          { kind: "Field", name: { kind: "Name", value: "retryAttemptNumber" } },
          { kind: "Field", name: { kind: "Name", value: "retryForExecutionId" } },
          { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExecutionRunRowFragment, unknown>;
export const SearchExecutionRunsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "searchExecutionRuns" },
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
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "filterGroups" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "EventFilterGroup" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "orderBy" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ExecutionRunOrder" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionRuns" },
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
                name: { kind: "Name", value: "startedAtGte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtGte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAtLte" },
                value: { kind: "Variable", name: { kind: "Name", value: "startedAtLte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filterGroups" },
                value: { kind: "Variable", name: { kind: "Name", value: "filterGroups" } },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "cursor" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "ExecutionRunRow" },
                            },
                          ],
                        },
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
      name: { kind: "Name", value: "ExecutionRunRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ExecutionRun" } },
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
          { kind: "Field", name: { kind: "Name", value: "durationMs" } },
          { kind: "Field", name: { kind: "Name", value: "stepCount" } },
          { kind: "Field", name: { kind: "Name", value: "error" } },
          { kind: "Field", name: { kind: "Name", value: "errorStepName" } },
          { kind: "Field", name: { kind: "Name", value: "instanceId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceName" } },
          { kind: "Field", name: { kind: "Name", value: "customerId" } },
          { kind: "Field", name: { kind: "Name", value: "customerName" } },
          { kind: "Field", name: { kind: "Name", value: "customerExternalId" } },
          { kind: "Field", name: { kind: "Name", value: "integrationId" } },
          { kind: "Field", name: { kind: "Name", value: "integrationName" } },
          { kind: "Field", name: { kind: "Name", value: "flowId" } },
          { kind: "Field", name: { kind: "Name", value: "flowName" } },
          { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
          { kind: "Field", name: { kind: "Name", value: "isReplay" } },
          { kind: "Field", name: { kind: "Name", value: "retryAttemptNumber" } },
          { kind: "Field", name: { kind: "Name", value: "retryForExecutionId" } },
          { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchExecutionRunsQuery, SearchExecutionRunsQueryVariables>;

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

export type EventOrder = {
  direction: OrderDirection;
  field: EventOrderField;
};

export type EventOrderField =
  | "CUSTOMER"
  | "FLOW"
  | "FLOW_CONFIG"
  | "INSTANCE"
  | "INTEGRATION"
  | "LOG_TYPE"
  | "MESSAGE"
  | "OCCURRED_AT"
  | "SEVERITY"
  | "TIMESTAMP";

export type EventType =
  | "EXECUTION_EVENT"
  | "EXECUTION_SECTION"
  | "LOG_EVENT"
  | "STEP_RESULT"
  | "TRIGGER_PAYLOAD";

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

/** Indicates the severity level of a log message. */
export type LogSeverityLevel = "DEBUG" | "ERROR" | "FATAL" | "INFO" | "METRIC" | "TRACE" | "WARN";

export type LogType =
  | "CONNECTION"
  | "DATA_SOURCE"
  | "EXECUTION"
  | "MANAGEMENT"
  | "RATE_LIMIT"
  | "SERVER_FUNCTION";

export type LogicalOperator = "AND" | "OR";

/** Represents the supported sort order directions. */
export type OrderDirection = "ASC" | "DESC";

export type LogEventRowFragment = {
  timestamp: string;
  severity: Types.LogSeverityLevel | null;
  message: string;
  logType: Types.LogType | null;
  stepName: string | null;
  stepDisplayName: string | null;
  loopStepName: string | null;
  loopStepIndex: number | null;
  executionResultId: string | null;
  instanceId: string | null;
  instanceName: string | null;
  customerName: string | null;
  integrationName: string | null;
  flowName: string | null;
};

export type StepResultEventRowFragment = {
  startedAt: string | null;
  endedAt: string | null;
  stepName: string | null;
  stepDisplayName: string | null;
  hasError: boolean | null;
  errorCode: string | null;
  componentKey: string | null;
  actionKey: string | null;
  branchName: string | null;
  loopStepName: string | null;
  loopStepIndex: number | null;
  isLoopStep: boolean | null;
  loopIterationCount: number | null;
  isRootResult: boolean | null;
  payloadTruncated: boolean | null;
  hasStoredPayload: boolean;
};

export type ExecutionRunEventsQueryVariables = Exact<{
  id: string | number;
  first?: number | null | undefined;
  after?: string | null | undefined;
  typeIn?: Array<Types.EventType> | Types.EventType | null | undefined;
  filterGroups?: Array<Types.EventFilterGroup> | Types.EventFilterGroup | null | undefined;
  orderBy?: Types.EventOrder | null | undefined;
}>;

export type ExecutionRunEventsQuery = {
  executionRun: {
    id: string;
    status: Types.ExecutionStatus;
    endedAt: string | null;
    events: {
      totalCount: number;
      nodes: Array<
        | { __typename: "ExecutionLifecycleEvent"; id: string; timestamp: string }
        | { __typename: "ExecutionSectionEvent"; id: string; timestamp: string }
        | {
            __typename: "LogEvent";
            id: string;
            timestamp: string;
            severity: Types.LogSeverityLevel | null;
            message: string;
            logType: Types.LogType | null;
            stepName: string | null;
            stepDisplayName: string | null;
            loopStepName: string | null;
            loopStepIndex: number | null;
            executionResultId: string | null;
            instanceId: string | null;
            instanceName: string | null;
            customerName: string | null;
            integrationName: string | null;
            flowName: string | null;
          }
        | {
            __typename: "StepResultEvent";
            id: string;
            timestamp: string;
            startedAt: string | null;
            endedAt: string | null;
            stepName: string | null;
            stepDisplayName: string | null;
            hasError: boolean | null;
            errorCode: string | null;
            componentKey: string | null;
            actionKey: string | null;
            branchName: string | null;
            loopStepName: string | null;
            loopStepIndex: number | null;
            isLoopStep: boolean | null;
            loopIterationCount: number | null;
            isRootResult: boolean | null;
            payloadTruncated: boolean | null;
            hasStoredPayload: boolean;
          }
        | { __typename: "TriggerPayloadEvent"; id: string; timestamp: string }
      >;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export const LogEventRowFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "LogEventRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "LogEvent" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "timestamp" } },
          { kind: "Field", name: { kind: "Name", value: "severity" } },
          { kind: "Field", name: { kind: "Name", value: "message" } },
          { kind: "Field", name: { kind: "Name", value: "logType" } },
          { kind: "Field", name: { kind: "Name", value: "stepName" } },
          { kind: "Field", name: { kind: "Name", value: "stepDisplayName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepIndex" } },
          { kind: "Field", name: { kind: "Name", value: "executionResultId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceName" } },
          { kind: "Field", name: { kind: "Name", value: "customerName" } },
          { kind: "Field", name: { kind: "Name", value: "integrationName" } },
          { kind: "Field", name: { kind: "Name", value: "flowName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LogEventRowFragment, unknown>;
export const StepResultEventRowFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "StepResultEventRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "StepResultEvent" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "endedAt" } },
          { kind: "Field", name: { kind: "Name", value: "stepName" } },
          { kind: "Field", name: { kind: "Name", value: "stepDisplayName" } },
          { kind: "Field", name: { kind: "Name", value: "hasError" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "componentKey" } },
          { kind: "Field", name: { kind: "Name", value: "actionKey" } },
          { kind: "Field", name: { kind: "Name", value: "branchName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepIndex" } },
          { kind: "Field", name: { kind: "Name", value: "isLoopStep" } },
          { kind: "Field", name: { kind: "Name", value: "loopIterationCount" } },
          { kind: "Field", name: { kind: "Name", value: "isRootResult" } },
          { kind: "Field", name: { kind: "Name", value: "payloadTruncated" } },
          { kind: "Field", name: { kind: "Name", value: "hasStoredPayload" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StepResultEventRowFragment, unknown>;
export const ExecutionRunEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "executionRunEvents" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "typeIn" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "EventType" } },
            },
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
          type: { kind: "NamedType", name: { kind: "Name", value: "EventOrder" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executionRun" },
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
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
                      name: { kind: "Name", value: "typeIn" },
                      value: { kind: "Variable", name: { kind: "Name", value: "typeIn" } },
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
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "__typename" } },
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "timestamp" } },
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "LogEventRow" },
                            },
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "StepResultEventRow" },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "LogEventRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "LogEvent" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "timestamp" } },
          { kind: "Field", name: { kind: "Name", value: "severity" } },
          { kind: "Field", name: { kind: "Name", value: "message" } },
          { kind: "Field", name: { kind: "Name", value: "logType" } },
          { kind: "Field", name: { kind: "Name", value: "stepName" } },
          { kind: "Field", name: { kind: "Name", value: "stepDisplayName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepIndex" } },
          { kind: "Field", name: { kind: "Name", value: "executionResultId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceId" } },
          { kind: "Field", name: { kind: "Name", value: "instanceName" } },
          { kind: "Field", name: { kind: "Name", value: "customerName" } },
          { kind: "Field", name: { kind: "Name", value: "integrationName" } },
          { kind: "Field", name: { kind: "Name", value: "flowName" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "StepResultEventRow" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "StepResultEvent" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "endedAt" } },
          { kind: "Field", name: { kind: "Name", value: "stepName" } },
          { kind: "Field", name: { kind: "Name", value: "stepDisplayName" } },
          { kind: "Field", name: { kind: "Name", value: "hasError" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "componentKey" } },
          { kind: "Field", name: { kind: "Name", value: "actionKey" } },
          { kind: "Field", name: { kind: "Name", value: "branchName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepName" } },
          { kind: "Field", name: { kind: "Name", value: "loopStepIndex" } },
          { kind: "Field", name: { kind: "Name", value: "isLoopStep" } },
          { kind: "Field", name: { kind: "Name", value: "loopIterationCount" } },
          { kind: "Field", name: { kind: "Name", value: "isRootResult" } },
          { kind: "Field", name: { kind: "Name", value: "payloadTruncated" } },
          { kind: "Field", name: { kind: "Name", value: "hasStoredPayload" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExecutionRunEventsQuery, ExecutionRunEventsQueryVariables>;

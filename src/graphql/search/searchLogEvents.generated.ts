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

export type SearchLogEventsQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  timestampGte?: string | null | undefined;
  timestampLte?: string | null | undefined;
  filterGroups?: Array<Types.EventFilterGroup> | Types.EventFilterGroup | null | undefined;
  orderBy?: Types.EventOrder | null | undefined;
}>;

export type SearchLogEventsQuery = {
  events: {
    totalCount: number;
    nodes: Array<
      | { __typename: "ExecutionLifecycleEvent"; id: string; timestamp: string }
      | { __typename: "ExecutionSectionEvent"; id: string; timestamp: string }
      | {
          __typename: "LogEvent";
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
          id: string;
          timestamp: string;
        }
      | { __typename: "StepResultEvent"; id: string; timestamp: string }
      | { __typename: "TriggerPayloadEvent"; id: string; timestamp: string }
    >;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const SearchLogEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "searchLogEvents" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "timestampGte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "timestampLte" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
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
                value: { kind: "ListValue", values: [{ kind: "EnumValue", value: "LOG_EVENT" }] },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "timestampGte" },
                value: { kind: "Variable", name: { kind: "Name", value: "timestampGte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "timestampLte" },
                value: { kind: "Variable", name: { kind: "Name", value: "timestampLte" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "LogEvent" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
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
} as unknown as DocumentNode<SearchLogEventsQuery, SearchLogEventsQueryVariables>;

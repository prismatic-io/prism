/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
/** Indicates what kind of Instance, if any, is related to this record. */
export type InstanceType = "INTEGRATION" | "WORKFLOW";

/** Allows specifying which field and direction to order by. */
export type LogOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: LogOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export type LogOrderField =
  | "CUSTOMER"
  | "FLOW"
  | "FLOW_CONFIG"
  | "INSTANCE"
  | "INTEGRATION"
  | "LOG_TYPE"
  | "MESSAGE"
  | "SEVERITY"
  | "TIMESTAMP";

/** Indicates the severity level of a log message. */
export type LogSeverityLevel = "DEBUG" | "ERROR" | "FATAL" | "INFO" | "METRIC" | "TRACE" | "WARN";

export type LogType =
  | "CONNECTION"
  | "DATA_SOURCE"
  | "EXECUTION"
  | "MANAGEMENT"
  | "RATE_LIMIT"
  | "SERVER_FUNCTION";

/** Represents the supported sort order directions. */
export type OrderDirection = "ASC" | "DESC";

export type LegacyLogsQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  timestampGte?: string | null | undefined;
  timestampLte?: string | null | undefined;
  executionResult?: string | number | null | undefined;
  instance?: string | number | null | undefined;
  customer?: string | number | null | undefined;
  integration?: string | number | null | undefined;
  flow?: string | number | null | undefined;
  flowConfig?: string | number | null | undefined;
  severity?: number | null | undefined;
  message?: string | null | undefined;
  logType?: string | null | undefined;
  logTypes?: Array<string | null | undefined> | string | null | undefined;
  isTestExecution?: boolean | null | undefined;
  instanceType?: Types.InstanceType | null | undefined;
  orderBy?: Types.LogOrder | null | undefined;
}>;

export type LegacyLogsQuery = {
  logs: {
    totalCount: number;
    nodes: Array<{
      id: string;
      timestamp: string;
      severity: Types.LogSeverityLevel;
      message: string;
      logType: Types.LogType | null;
      stepName: string | null;
      loopStepName: string | null;
      loopStepIndex: number | null;
      executionResultId: string | null;
      instanceId: string | null;
      instanceName: string | null;
      customerName: string | null;
      integrationName: string | null;
      flowName: string | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export const LegacyLogsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "legacyLogs" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "executionResult" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "flowConfig" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "severity" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "message" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "logType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "logTypes" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "orderBy" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "LogOrder" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "logs" },
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
                name: { kind: "Name", value: "timestamp_Gte" },
                value: { kind: "Variable", name: { kind: "Name", value: "timestampGte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "timestamp_Lte" },
                value: { kind: "Variable", name: { kind: "Name", value: "timestampLte" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "executionResult" },
                value: { kind: "Variable", name: { kind: "Name", value: "executionResult" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "instance" },
                value: { kind: "Variable", name: { kind: "Name", value: "instance" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "customer" },
                value: { kind: "Variable", name: { kind: "Name", value: "customer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "integration" },
                value: { kind: "Variable", name: { kind: "Name", value: "integration" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "flow" },
                value: { kind: "Variable", name: { kind: "Name", value: "flow" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "flowConfig" },
                value: { kind: "Variable", name: { kind: "Name", value: "flowConfig" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "severity" },
                value: { kind: "Variable", name: { kind: "Name", value: "severity" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "message_Icontains" },
                value: { kind: "Variable", name: { kind: "Name", value: "message" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "logType" },
                value: { kind: "Variable", name: { kind: "Name", value: "logType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "logType_In" },
                value: { kind: "Variable", name: { kind: "Name", value: "logTypes" } },
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
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "timestamp" } },
                      { kind: "Field", name: { kind: "Name", value: "severity" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                      { kind: "Field", name: { kind: "Name", value: "logType" } },
                      { kind: "Field", name: { kind: "Name", value: "stepName" } },
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
} as unknown as DocumentNode<LegacyLogsQuery, LegacyLogsQueryVariables>;

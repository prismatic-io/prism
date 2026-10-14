/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
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

export type ExecutionRunResultType =
  | "CANCELED_AS_DUPLICATE"
  | "CANCELED_BY_USER"
  | "COMPLETED"
  | "ERROR"
  | "POLLED_NO_CHANGES";

export type ExecutionStatus = "CANCELED" | "CANCELING" | "ERROR" | "PENDING" | "QUEUED" | "SUCCESS";

export type GetExecutionRunQueryVariables = Exact<{
  id: string | number;
}>;

export type GetExecutionRunQuery = {
  executionRun: {
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
    instanceType: string | null;
    customerId: string | null;
    customerName: string | null;
    customerExternalId: string | null;
    integrationId: string | null;
    integrationName: string | null;
    integrationVersionSequenceId: string | null;
    flowId: string | null;
    flowName: string | null;
    flowStableId: string | null;
    flowConfigId: string | null;
    isTestExecution: boolean | null;
    isReplay: boolean | null;
    isCodeNative: boolean | null;
    usesBatching: boolean | null;
    fromPreprocessFlow: boolean | null;
    retryAttemptNumber: number | null;
    retryForExecutionId: string | null;
    allowUpdate: boolean;
    payload: string | null;
    payloadTruncated: boolean | null;
    hasStoredPayload: boolean;
    lineage: { invokedBy: { execution: { id: string } | null } | null };
    stepBuckets: Array<{
      index: number;
      startedAt: string;
      endedAt: string;
      count: number;
      failedCount: number;
      totalDurationMs: number;
      firstLabel: string | null;
      lastLabel: string | null;
    }>;
  } | null;
};

export const GetExecutionRunDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getExecutionRun" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
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
                { kind: "Field", name: { kind: "Name", value: "instanceType" } },
                { kind: "Field", name: { kind: "Name", value: "customerId" } },
                { kind: "Field", name: { kind: "Name", value: "customerName" } },
                { kind: "Field", name: { kind: "Name", value: "customerExternalId" } },
                { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                { kind: "Field", name: { kind: "Name", value: "integrationName" } },
                { kind: "Field", name: { kind: "Name", value: "integrationVersionSequenceId" } },
                { kind: "Field", name: { kind: "Name", value: "flowId" } },
                { kind: "Field", name: { kind: "Name", value: "flowName" } },
                { kind: "Field", name: { kind: "Name", value: "flowStableId" } },
                { kind: "Field", name: { kind: "Name", value: "flowConfigId" } },
                { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
                { kind: "Field", name: { kind: "Name", value: "isReplay" } },
                { kind: "Field", name: { kind: "Name", value: "isCodeNative" } },
                { kind: "Field", name: { kind: "Name", value: "usesBatching" } },
                { kind: "Field", name: { kind: "Name", value: "fromPreprocessFlow" } },
                { kind: "Field", name: { kind: "Name", value: "retryAttemptNumber" } },
                { kind: "Field", name: { kind: "Name", value: "retryForExecutionId" } },
                { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
                { kind: "Field", name: { kind: "Name", value: "payload" } },
                { kind: "Field", name: { kind: "Name", value: "payloadTruncated" } },
                { kind: "Field", name: { kind: "Name", value: "hasStoredPayload" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lineage" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invokedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "execution" },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepBuckets" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "bucketSize" },
                      value: { kind: "IntValue", value: "100" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "index" } },
                      { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                      { kind: "Field", name: { kind: "Name", value: "failedCount" } },
                      { kind: "Field", name: { kind: "Name", value: "totalDurationMs" } },
                      { kind: "Field", name: { kind: "Name", value: "firstLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "lastLabel" } },
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
} as unknown as DocumentNode<GetExecutionRunQuery, GetExecutionRunQueryVariables>;

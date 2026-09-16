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

export type LegacyExecutionResultQueryVariables = Exact<{
  id: string | number;
}>;

export type LegacyExecutionResultQuery = {
  executionResult: {
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
    isLre: boolean;
    usesBatching: boolean | null;
    instanceType: Types.InstanceType | null;
    retryCount: number | null;
    maxRetryCount: number | null;
    retryNextAt: string | null;
    allowUpdate: boolean;
    requestPayloadUrl: string;
    retryForExecution: { id: string } | null;
    replayForExecution: { id: string } | null;
    instance: {
      id: string;
      name: string;
      customer: { id: string; name: string; externalId: string | null };
    } | null;
    integration: { id: string; name: string; versionSequenceId: string | null } | null;
    flow: { id: string; name: string; stableKey: string | null } | null;
    lineage: { invokedBy: { execution: { id: string } | null } | null };
  } | null;
};

export const LegacyExecutionResultDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "legacyExecutionResult" },
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
            name: { kind: "Name", value: "executionResult" },
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
                { kind: "Field", name: { kind: "Name", value: "stepCount" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "isTestExecution" } },
                { kind: "Field", name: { kind: "Name", value: "isLre" } },
                { kind: "Field", name: { kind: "Name", value: "usesBatching" } },
                { kind: "Field", name: { kind: "Name", value: "instanceType" } },
                { kind: "Field", name: { kind: "Name", value: "retryCount" } },
                { kind: "Field", name: { kind: "Name", value: "maxRetryCount" } },
                { kind: "Field", name: { kind: "Name", value: "retryNextAt" } },
                { kind: "Field", name: { kind: "Name", value: "allowUpdate" } },
                { kind: "Field", name: { kind: "Name", value: "requestPayloadUrl" } },
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
                      { kind: "Field", name: { kind: "Name", value: "versionSequenceId" } },
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
                      { kind: "Field", name: { kind: "Name", value: "stableKey" } },
                    ],
                  },
                },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LegacyExecutionResultQuery, LegacyExecutionResultQueryVariables>;

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

export type StepPayloadUrlQueryVariables = Exact<{
  id: string | number;
  filterGroups?: Array<Types.EventFilterGroup> | Types.EventFilterGroup | null | undefined;
}>;

export type StepPayloadUrlQuery = {
  executionRun: {
    id: string;
    events: {
      nodes: Array<
        | { __typename: "ExecutionLifecycleEvent"; id: string }
        | { __typename: "ExecutionSectionEvent"; id: string }
        | { __typename: "LogEvent"; id: string }
        | {
            __typename: "StepResultEvent";
            stepName: string | null;
            hasStoredPayload: boolean;
            payloadUrl: string | null;
            id: string;
          }
        | { __typename: "TriggerPayloadEvent"; id: string }
      >;
    };
  } | null;
};

export const StepPayloadUrlDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "stepPayloadUrl" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "filterGroups" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "EventFilterGroup" } },
            },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "1" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "typeIn" },
                      value: {
                        kind: "ListValue",
                        values: [{ kind: "EnumValue", value: "STEP_RESULT" }],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "filterGroups" },
                      value: { kind: "Variable", name: { kind: "Name", value: "filterGroups" } },
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
                            { kind: "Field", name: { kind: "Name", value: "__typename" } },
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "StepResultEvent" },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "stepName" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "hasStoredPayload" },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "payloadUrl" } },
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
} as unknown as DocumentNode<StepPayloadUrlQuery, StepPayloadUrlQueryVariables>;

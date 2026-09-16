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

export type CountExecutionRunsQueryVariables = Exact<{
  startedAtGte?: string | null | undefined;
  startedAtLte?: string | null | undefined;
  filterGroups?: Array<Types.EventFilterGroup> | Types.EventFilterGroup | null | undefined;
}>;

export type CountExecutionRunsQuery = { executionRunKpis: { count: number } };

export const CountExecutionRunsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "countExecutionRuns" },
      variableDefinitions: [
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
            name: { kind: "Name", value: "executionRunKpis" },
            arguments: [
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
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "count" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CountExecutionRunsQuery, CountExecutionRunsQueryVariables>;

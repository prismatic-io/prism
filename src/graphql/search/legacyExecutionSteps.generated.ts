/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type LegacyExecutionStepsQueryVariables = Exact<{
  id: string | number;
  first?: number | null | undefined;
  after?: string | null | undefined;
  hasError?: boolean | null | undefined;
}>;

export type LegacyExecutionStepsQuery = {
  executionResult: {
    id: string;
    stepResults: {
      totalCount: number;
      nodes: Array<{
        id: string;
        startedAt: string;
        endedAt: string | null;
        stepName: string | null;
        displayStepName: string | null;
        hasError: boolean;
        branchName: string | null;
        loopStepName: string | null;
        loopStepIndex: number | null;
        isLoopStep: boolean;
        isRootResult: boolean;
        resultsUrl: string;
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export const LegacyExecutionStepsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "legacyExecutionSteps" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "hasError" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stepResults" },
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
                      name: { kind: "Name", value: "hasError" },
                      value: { kind: "Variable", name: { kind: "Name", value: "hasError" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "STARTED_AT" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "ASC" },
                          },
                        ],
                      },
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
                            { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "endedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "stepName" } },
                            { kind: "Field", name: { kind: "Name", value: "displayStepName" } },
                            { kind: "Field", name: { kind: "Name", value: "hasError" } },
                            { kind: "Field", name: { kind: "Name", value: "branchName" } },
                            { kind: "Field", name: { kind: "Name", value: "loopStepName" } },
                            { kind: "Field", name: { kind: "Name", value: "loopStepIndex" } },
                            { kind: "Field", name: { kind: "Name", value: "isLoopStep" } },
                            { kind: "Field", name: { kind: "Name", value: "isRootResult" } },
                            { kind: "Field", name: { kind: "Name", value: "resultsUrl" } },
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
  ],
} as unknown as DocumentNode<LegacyExecutionStepsQuery, LegacyExecutionStepsQueryVariables>;

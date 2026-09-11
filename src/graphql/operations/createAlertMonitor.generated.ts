/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type CreateAlertMonitorMutationVariables = Exact<{
  name: string;
  instance: string | number;
  triggers: Array<string | number | null | undefined> | string | number;
  logSeverity?: number | null | undefined;
  duration?: number | null | undefined;
  groups?: Array<string | number | null | undefined> | string | number | null | undefined;
  users?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;

export type CreateAlertMonitorMutation = {
  createAlertMonitor: {
    alertMonitor: { id: string } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const CreateAlertMonitorDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createAlertMonitor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "instance" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "triggers" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "logSeverity" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "duration" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groups" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "users" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAlertMonitor" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "instance" },
                      value: { kind: "Variable", name: { kind: "Name", value: "instance" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "triggers" },
                      value: { kind: "Variable", name: { kind: "Name", value: "triggers" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "logSeverityLevelCondition" },
                      value: { kind: "Variable", name: { kind: "Name", value: "logSeverity" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "durationSecondsCondition" },
                      value: { kind: "Variable", name: { kind: "Name", value: "duration" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "groups" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groups" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "users" },
                      value: { kind: "Variable", name: { kind: "Name", value: "users" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "alertMonitor" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
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
} as unknown as DocumentNode<CreateAlertMonitorMutation, CreateAlertMonitorMutationVariables>;

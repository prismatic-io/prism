/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
/** Represents a Theme Color of a given Type and the Variant that it is associated with. */
export type ThemeColorInput = {
  /** The type of Color. */
  type: string;
  /** The value of the color. */
  value: string;
  /** The Theme variant the color is associated with */
  variant: string;
};

/** Represents a Property used to style a Theme */
export type ThemePropertyInput = {
  /** The type of Theme Property. */
  type: string;
  /** The value of the Property. */
  value: string;
  /** The Theme variant the color is associated with */
  variant?: string | null | undefined;
};

export type UpdateThemeMutationVariables = Exact<{
  colors?:
    | Array<Types.ThemeColorInput | null | undefined>
    | Types.ThemeColorInput
    | null
    | undefined;
  properties?:
    | Array<Types.ThemePropertyInput | null | undefined>
    | Types.ThemePropertyInput
    | null
    | undefined;
}>;

export type UpdateThemeMutation = {
  updateTheme: {
    theme: { id: string } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const UpdateThemeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateTheme" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "colors" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ThemeColorInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "properties" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ThemePropertyInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateTheme" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "colors" },
                      value: { kind: "Variable", name: { kind: "Name", value: "colors" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "properties" },
                      value: { kind: "Variable", name: { kind: "Name", value: "properties" } },
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
                  name: { kind: "Name", value: "theme" },
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
} as unknown as DocumentNode<UpdateThemeMutation, UpdateThemeMutationVariables>;

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "../schema.generated.js";
export type ThemeColorType =
  /** Accent */
  | "ACCENT"
  /** Background */
  | "BACKGROUND"
  /** Debug */
  | "DEBUG"
  /** Designer Shell */
  | "DESIGNER_SHELL"
  /** Error */
  | "ERROR"
  /** Icon Color */
  | "ICON_COLOR"
  /** Info */
  | "INFO"
  /** Link Color */
  | "LINK_COLOR"
  /** Metric */
  | "METRIC"
  /** Neutral */
  | "NEUTRAL"
  /** Other01 */
  | "OTHER01"
  /** Primary */
  | "PRIMARY"
  /** Secondary */
  | "SECONDARY"
  /** Sidebar */
  | "SIDEBAR"
  /** Success */
  | "SUCCESS"
  /** Trace */
  | "TRACE"
  /** Warning */
  | "WARNING";

export type ThemeColorVariant =
  /** Dark */
  | "DARK"
  /** Embedded Dark */
  | "EMBEDDED_DARK"
  /** Embedded Light */
  | "EMBEDDED_LIGHT"
  /** Light */
  | "LIGHT";

export type ThemePropertyType =
  /** Border Radius */
  | "BORDER_RADIUS"
  /** Disable Elevation */
  | "DISABLE_ELEVATION";

export type ThemePropertyVariant =
  /** Dark */
  | "DARK"
  /** Embedded Dark */
  | "EMBEDDED_DARK"
  /** Embedded Light */
  | "EMBEDDED_LIGHT"
  /** Light */
  | "LIGHT";

export type GetThemeQueryVariables = Exact<{ [key: string]: never }>;

export type GetThemeQuery = {
  theme: {
    colors: {
      totalCount: number;
      nodes: Array<{ type: Types.ThemeColorType; value: string; variant: Types.ThemeColorVariant }>;
    };
    properties: {
      totalCount: number;
      nodes: Array<{
        type: Types.ThemePropertyType;
        value: string;
        variant: Types.ThemePropertyVariant | null;
      }>;
    };
  } | null;
};

export const GetThemeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getTheme" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "theme" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "colors" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "100" },
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
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                            { kind: "Field", name: { kind: "Name", value: "variant" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "properties" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "100" },
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
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                            { kind: "Field", name: { kind: "Name", value: "variant" } },
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
} as unknown as DocumentNode<GetThemeQuery, GetThemeQueryVariables>;

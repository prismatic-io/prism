/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type MediaType = "ATTACHMENT" | "AVATAR";

export type GetPresignedUrlQueryVariables = Exact<{
  objectId: string | number;
  fileName: string;
  mediaType: Types.MediaType;
}>;

export type GetPresignedUrlQuery = {
  uploadMedia: { uploadUrl: string | null; objectUrl: string | null; error: string | null };
};

export const GetPresignedUrlDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getPresignedUrl" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "objectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fileName" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "mediaType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "MediaType" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "uploadMedia" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "objectId" },
                value: { kind: "Variable", name: { kind: "Name", value: "objectId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "fileName" },
                value: { kind: "Variable", name: { kind: "Name", value: "fileName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "mediaType" },
                value: { kind: "Variable", name: { kind: "Name", value: "mediaType" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "uploadUrl" } },
                { kind: "Field", name: { kind: "Name", value: "objectUrl" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPresignedUrlQuery, GetPresignedUrlQueryVariables>;

import { URL } from "url";
import { request, RequestDocument } from "graphql-request";
import { getAccessToken, prismaticUrl } from "./auth";

interface GQLRequest {
  document: RequestDocument;
  variables?: Record<string, unknown>;
}

interface ErroredResult {
  [key: string]: unknown;
  errors: {
    field: string;
    messages: string[];
  }[];
}

const isErrored = (result: unknown): result is ErroredResult => {
  if (
    !(
      Boolean(result) &&
      typeof result === "object" &&
      result !== null &&
      "errors" in result
    )
  ) {
    return false;
  }

  const assumed = result as ErroredResult;
  return Boolean(assumed.errors) && assumed.errors.length > 0;
};

const formatError = (field: string, messages: string[]) => {
  const message = messages.join("\n");
  if (field === "__all__") {
    return message;
  }
  return `${field}: ${message}`;
};

export const gqlRequest = async <T = any>({
  document,
  variables,
}: GQLRequest): Promise<T> => {
  const accessToken = await getAccessToken();
  const url = new URL("/api", prismaticUrl).toString();

  const result = await request<T>(url, document, variables, {
    Authorization: `Bearer ${accessToken}`,
    "Prismatic-Client": "prism",
  });

  const errors = Object.values(result)
    .filter(isErrored)
    .flatMap(({ errors }) => errors)
    .map(({ field, messages }) => formatError(field, messages));
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return result;
};

export { gql } from "graphql-request";

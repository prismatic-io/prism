import { URL } from "url";
import { getAccessToken, prismaticUrl } from "./auth.js";

type RequestDocument = string;

interface GQLRequest {
  document: RequestDocument;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

interface ErroredResult {
  [key: string]: unknown;
  errors: {
    field: string;
    messages: string[];
  }[];
}

export class ClientError extends Error {
  response: {
    errors?: Array<{ message: string }>;
    status: number;
    headers: Record<string, string>;
  };
  request: {
    query: string;
    variables?: Record<string, unknown>;
  };

  constructor(
    response: GraphQLResponse<unknown> & { status: number; headers: Record<string, string> },
    request: { query: string; variables?: Record<string, unknown> },
  ) {
    const message = response.errors?.[0]?.message || `GraphQL Error (Code: ${response.status})`;
    super(message);
    this.name = "ClientError";
    this.response = {
      errors: response.errors,
      status: response.status,
      headers: response.headers,
    };
    this.request = request;
  }
}

export const gql = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ""), "");
};

const isErrored = (result: unknown): result is ErroredResult => {
  if (!(Boolean(result) && typeof result === "object" && result !== null && "errors" in result)) {
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

export const gqlRequest = async <T = any>({ document, variables }: GQLRequest): Promise<T> => {
  const accessToken = await getAccessToken();
  const url = new URL("/api", prismaticUrl).toString();

  if (process.env.PRISMATIC_PRINT_REQUESTS) {
    console.log("=================================");
    console.log(`GraphQL Request: ${document}`);
    console.log(`Variables: ${JSON.stringify(variables)}`);
    console.log("=================================");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Prismatic-Client": "prism",
      },
      body: JSON.stringify({
        query: document,
        variables: variables || {},
      }),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Network request to ${url} failed: ${errorMessage}`);
  }

  const headersObj = Object.fromEntries(response.headers);

  let responseBody: GraphQLResponse<T>;
  try {
    responseBody = await response.json();
  } catch (error) {
    throw new ClientError(
      {
        errors: [{ message: `Failed to parse response: ${response.statusText}` }],
        status: response.status,
        headers: headersObj,
      },
      { query: document, variables },
    );
  }

  if (!responseBody.data) {
    throw new ClientError(
      {
        ...responseBody,
        status: response.status,
        headers: headersObj,
      },
      { query: document, variables },
    );
  }

  const result = responseBody.data as T;

  const errors = Object.values(result as any)
    .filter(isErrored)
    .flatMap(({ errors }) => errors)
    .map(({ field, messages }) => formatError(field, messages));
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return result;
};

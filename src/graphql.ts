import { URL } from "url";
import { z } from "zod";
import { getAccessToken } from "./auth.js";
import { writeCommandOutput } from "./command.js";
import { getPrismaticUrl } from "./context.js";
import { fetch } from "./utils/http.js";

interface GQLRequest<TVariables = Record<string, unknown>> {
  document: string;
  variables?: TVariables;
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
  return erroredResultSchema.safeParse(result).success;
};

const erroredResultSchema = z.looseObject({
  errors: z.array(
    z.object({
      field: z.string(),
      messages: z.array(z.string()),
    }),
  ),
});

const graphQLErrorSchema = z.object({
  message: z.string(),
  locations: z.array(z.object({ line: z.number(), column: z.number() })).optional(),
  path: z.array(z.union([z.string(), z.number()])).optional(),
});

const graphQLResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema.optional(),
    errors: z.array(graphQLErrorSchema).optional(),
  });

const formatError = (field: string, messages: string[]) => {
  const message = messages.join("\n");
  if (field === "__all__") {
    return message;
  }
  return `${field}: ${message}`;
};

export const gqlRequest = async <T = any, TVariables = Record<string, unknown>>({
  document,
  variables,
}: GQLRequest<TVariables>): Promise<T> => {
  const accessToken = await getAccessToken();
  const url = new URL("/api", await getPrismaticUrl()).toString();

  const query = document;

  if (process.env.PRISMATIC_PRINT_REQUESTS) {
    writeCommandOutput("=================================");
    writeCommandOutput(`GraphQL Request: ${query}`);
    writeCommandOutput(`Variables: ${JSON.stringify(variables)}`);
    writeCommandOutput("=================================");
  }

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Prismatic-Client": "prism",
      },
      body: JSON.stringify({
        query,
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
    responseBody = graphQLResponseSchema(z.custom<T>()).parse(await response.json());
  } catch (_error) {
    throw new ClientError(
      {
        errors: [{ message: `Failed to parse response: ${response.statusText}` }],
        status: response.status,
        headers: headersObj,
      },
      { query, variables: variables || {} },
    );
  }

  if (!responseBody.data) {
    throw new ClientError(
      {
        ...responseBody,
        status: response.status,
        headers: headersObj,
      },
      { query, variables: variables || {} },
    );
  }

  const result = responseBody.data;

  const errors = Object.values(result)
    .filter(isErrored)
    .flatMap(({ errors }) => errors)
    .map(({ field, messages }) => formatError(field, messages));
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return result;
};

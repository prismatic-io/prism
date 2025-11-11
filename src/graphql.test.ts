import { describe, it, expect, mock, beforeEach } from "bun:test";
import { gql, gqlRequest } from "./graphql.js";

mock.module("./auth.js", () => ({
  getAccessToken: mock(() => Promise.resolve("test-token")),
  prismaticUrl: "https://example.com",
}));

// Mock responses for testing
const mockResponses: Map<string, { status: number; body: any }> = new Map();

// Mock our fetch to use test responses
mock.module("./utils/http.js", () => ({
  fetch: async (url: string, options?: any) => {
    const mockKey = `${options?.method || "GET"}:${url}`;
    const mockResponse = mockResponses.get(mockKey);

    if (mockResponse) {
      return {
        ok: mockResponse.status >= 200 && mockResponse.status < 300,
        status: mockResponse.status,
        headers: new Headers(),
        json: async () => mockResponse.body,
      };
    }

    // Should not reach here in tests
    throw new Error(`Unmocked request: ${mockKey}`);
  },
  createFetch: () => globalThis.fetch,
}));

beforeEach(() => {
  mockResponses.clear();
});

describe("gql", () => {
  it("returns GraphQL query string without interpolation", () => {
    const query = gql`
      query {
        user {
          name
        }
      }
    `;
    expect(query).toContain("query");
    expect(query).toContain("user");
    expect(query).toContain("name");
  });

  it("interpolates variables into query string", () => {
    const fieldName = "email";
    const query = gql`
      query {
        user {
          ${fieldName}
        }
      }
    `;
    expect(query).toContain("email");
    expect(query).not.toContain("fieldName");
  });
});

describe("gqlRequest", () => {
  it("deserializes 400 responses with errors", async () => {
    const fieldName = "email";
    const errorMessage = "This field is required";
    const expectedError = `${fieldName}: ${errorMessage}`;

    mockResponses.set("POST:https://example.com/api", {
      status: 400,
      body: {
        data: {
          createUser: {
            errors: [{ field: fieldName, messages: [errorMessage] }],
          },
        },
      },
    });

    await expect(gqlRequest({ document: "mutation { createUser }" })).rejects.toThrow(
      expectedError,
    );
  });

  it("deserializes 200 responses", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    mockResponses.set("POST:https://example.com/api", {
      status: 200,
      body: { data: { [fieldName]: fieldValue } },
    });

    const result = await gqlRequest({ document: "query { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 400 responses without errors", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    mockResponses.set("POST:https://example.com/api", {
      status: 400,
      body: { data: { [fieldName]: fieldValue } },
    });

    const result = await gqlRequest({ document: "query { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 401 responses", async () => {
    const errorMessage = "Unauthorized";

    mockResponses.set("POST:https://example.com/api", {
      status: 401,
      body: { errors: [{ message: errorMessage }] },
    });

    const error = await gqlRequest({ document: "query { test }" }).catch((e) => e);

    expect(error.name).toBe("ClientError");
    expect(error.message).toBe(errorMessage);
    expect(error.response.status).toBe(401);
    expect(error.response.errors).toEqual([{ message: errorMessage }]);
  });

  it("deserializes 403 responses", async () => {
    const errorMessage = "Forbidden";

    mockResponses.set("POST:https://example.com/api", {
      status: 403,
      body: { errors: [{ message: errorMessage }] },
    });

    await expect(gqlRequest({ document: "query { test }" })).rejects.toThrow();
  });
});

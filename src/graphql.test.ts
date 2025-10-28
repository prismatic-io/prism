import { describe, it, expect, mock, beforeAll, afterEach, afterAll } from "bun:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/native";
import { gql, gqlRequest } from "./graphql.js";

mock.module("./auth.js", () => ({
  getAccessToken: mock(() => Promise.resolve("test-token")),
  prismaticUrl: "https://example.com",
}));

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

    server.use(
      http.post("https://example.com/api", () => {
        return HttpResponse.json(
          {
            data: {
              createUser: {
                errors: [{ field: fieldName, messages: [errorMessage] }],
              },
            },
          },
          { status: 400 },
        );
      }),
    );

    await expect(gqlRequest({ document: "mutation { createUser }" })).rejects.toThrow(
      expectedError,
    );
  });

  it("deserializes 200 responses", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    server.use(
      http.post("https://example.com/api", () => {
        return HttpResponse.json({ data: { [fieldName]: fieldValue } });
      }),
    );

    const result = await gqlRequest({ document: "query { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 400 responses without errors", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    server.use(
      http.post("https://example.com/api", () => {
        return HttpResponse.json({ data: { [fieldName]: fieldValue } }, { status: 400 });
      }),
    );

    const result = await gqlRequest({ document: "query { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 401 responses", async () => {
    const errorMessage = "Unauthorized";

    server.use(
      http.post("https://example.com/api", () => {
        return HttpResponse.json({ errors: [{ message: errorMessage }] }, { status: 401 });
      }),
    );

    const error = await gqlRequest({ document: "query { test }" }).catch((e) => e);

    expect(error.name).toBe("ClientError");
    expect(error.message).toBe(errorMessage);
    expect(error.response.status).toBe(401);
    expect(error.response.errors).toEqual([{ message: errorMessage }]);
  });

  it("deserializes 403 responses", async () => {
    const errorMessage = "Forbidden";

    server.use(
      http.post("https://example.com/api", () => {
        return HttpResponse.json({ errors: [{ message: errorMessage }] }, { status: 403 });
      }),
    );

    await expect(gqlRequest({ document: "query { test }" })).rejects.toThrow();
  });
});

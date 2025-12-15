import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { graphql, HttpResponse } from "msw";
import { gql, gqlRequest } from "./graphql.js";

vi.mock("./auth.js", () => ({
  getAccessToken: vi.fn(() => Promise.resolve("test-token")),
  prismaticUrl: "https://example.com",
}));

vi.mock("./utils/http.js", async () => {
  return {
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
    createFetch: () => fetch,
  };
});

const api = graphql.link("https://example.com/api");

const server = setupServer(
  api.operation(({ operationName }) => {
    return HttpResponse.json({ data: null });
  }),
);

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
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("deserializes 400 responses with errors", async () => {
    const fieldName = "email";
    const errorMessage = "This field is required";
    const expectedError = `${fieldName}: ${errorMessage}`;

    server.use(
      api.mutation("createUser", () => {
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

    await expect(gqlRequest({ document: "mutation createUser { createUser }" })).rejects.toThrow(
      expectedError,
    );
  });

  it("deserializes 200 responses", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    server.use(
      api.query("test", () => {
        return HttpResponse.json({ data: { [fieldName]: fieldValue } }, { status: 200 });
      }),
    );

    const result = await gqlRequest({ document: "query test { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 400 responses without errors", async () => {
    const fieldName = "someField";
    const fieldValue = "value";

    server.use(
      api.query("test", () => {
        return HttpResponse.json({ data: { [fieldName]: fieldValue } }, { status: 400 });
      }),
    );

    const result = await gqlRequest({ document: "query test { test }" });
    expect(result).toHaveProperty(fieldName, fieldValue);
  });

  it("deserializes 401 responses", async () => {
    const errorMessage = "Unauthorized";

    server.use(
      api.query("test", () => {
        return HttpResponse.json({ errors: [{ message: errorMessage }] }, { status: 401 });
      }),
    );

    const error = await gqlRequest({ document: "query test { test }" }).catch((e) => e);

    expect(error.name).toBe("ClientError");
    expect(error.message).toBe(errorMessage);
    expect(error.response.status).toBe(401);
    expect(error.response.errors).toEqual([{ message: errorMessage }]);
  });

  it("deserializes 403 responses", async () => {
    const errorMessage = "Forbidden";

    server.use(
      api.query("test", () => {
        return HttpResponse.json({ errors: [{ message: errorMessage }] }, { status: 403 });
      }),
    );

    await expect(gqlRequest({ document: "query test { test }" })).rejects.toThrow();
  });
});

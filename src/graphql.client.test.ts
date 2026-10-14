import { print } from "graphql";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateCustomerDocument } from "./graphql/operations/createCustomer.generated.js";
import { ClientError, gqlRequest, requireResource } from "./graphql.js";

const respond = (body: unknown, status = 200) => {
  const fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

afterEach(() => vi.unstubAllGlobals());

describe("GraphQL transport", () => {
  it("prints generated documents and sends variables with authentication", async () => {
    const data = { createCustomer: { customer: { id: "customer-1" }, errors: [] } };
    const fetch = respond({ data });
    const variables = { name: "Widgets", labels: ["Production"] };
    expect(await gqlRequest({ document: CreateCustomerDocument, variables })).toEqual(data);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Prismatic-Client": "prism",
        }),
        body: JSON.stringify({ query: print(CreateCustomerDocument), variables }),
      }),
    );
  });

  it("continues to accept arbitrary query strings for the public graphql command", async () => {
    const fetch = respond({ data: { customField: "value" } });
    const document = "query Custom { customField }";
    expect(await gqlRequest({ document })).toEqual({ customField: "value" });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ query: document, variables: {} });
  });

  it("preserves server errors and request details", async () => {
    respond({ errors: [{ message: "Permission denied" }] }, 403);
    await expect(
      gqlRequest({ document: CreateCustomerDocument, variables: { name: "Widgets" } }),
    ).rejects.toMatchObject({
      name: "ClientError",
      message: "Permission denied",
      response: { status: 403 },
      request: { variables: { name: "Widgets" } },
    });
  });

  it("rejects malformed response envelopes", async () => {
    respond({ errors: "invalid" });
    await expect(gqlRequest({ document: CreateCustomerDocument })).rejects.toBeInstanceOf(
      ClientError,
    );
  });

  it("reports mutation field errors before callers inspect nullable resources", async () => {
    respond({
      data: {
        createCustomer: {
          customer: null,
          errors: [
            { field: "name", messages: ["Already exists"] },
            { field: "__all__", messages: ["Creation failed"] },
          ],
        },
      },
    });
    await expect(gqlRequest({ document: CreateCustomerDocument })).rejects.toThrow(
      "name: Already exists\nCreation failed",
    );
  });
});

describe("required GraphQL resources", () => {
  it.each([null, undefined])("reports missing resource %s", (value) => {
    expect(() => requireResource(value, "customer")).toThrow(
      expect.objectContaining({
        message: "customer not found",
        code: "NOT_FOUND",
        exitCode: 1,
      }),
    );
  });
  it("returns present resources unchanged", () => {
    const customer = { id: "customer-1" };
    expect(requireResource(customer, "customer")).toBe(customer);
  });
});

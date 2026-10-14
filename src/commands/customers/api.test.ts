import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";
import { runCommand } from "../../test-command.js";
import CreateCustomer from "./create.js";
import DeleteCustomer from "./delete.js";
import CustomerList from "./list.js";

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("preserves field-level API rejection details in the customer error", async () => {
  server.use(
    api.mutation("createCustomer", () =>
      HttpResponse.json({
        data: {
          createCustomer: {
            customer: null,
            errors: [{ field: "name", messages: ["A customer with this name already exists"] }],
          },
        },
      }),
    ),
  );
  await expect(
    runCommand(CreateCustomer, ["--agent", "--yes", "--name", "Acme"]),
  ).rejects.toMatchObject({
    code: "CUSTOMER_CREATE_FAILED",
    exitCode: 1,
    retryable: false,
    message: "name: A customer with this name already exists",
  });
});

it("does not report successful deletion when the API rejects the mutation", async () => {
  server.use(
    api.mutation("deleteCustomer", () =>
      HttpResponse.json({
        data: {
          deleteCustomer: {
            customer: null,
            errors: [{ field: "__all__", messages: ["Customer still has active instances"] }],
          },
        },
      }),
    ),
  );
  await expect(
    runCommand(DeleteCustomer, ["--agent", "--yes", "customer-1"]),
  ).rejects.toMatchObject({
    code: "CUSTOMER_DELETE_FAILED",
    exitCode: 1,
    retryable: false,
    message: "Customer still has active instances",
  });
});

it.each([401, 403])("retains an HTTP %s authentication or permission failure", async (status) => {
  server.use(
    api.query("listCustomers", () =>
      HttpResponse.json({ errors: [{ message: "Access denied" }] }, { status }),
    ),
  );
  await expect(runCommand(CustomerList, ["--agent"])).rejects.toMatchObject({
    code: status === 401 ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
    exitCode: 1,
    retryable: false,
    message: "Access denied",
  });
});

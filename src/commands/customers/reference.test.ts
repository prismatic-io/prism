import { Mcp } from "incur";
import { describe, expect, it, vi } from "vitest";
import { serve } from "../../cli.js";
import { Commands } from "../../index.js";
import { ClientError, gqlRequest } from "../../graphql.js";
import { commandMiddleware, commandVars, environmentOptions } from "../../command.js";
import { runWithMcpTransport } from "../../compatibility.js";

vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

async function invoke(argv: string[], approval = true) {
  let output = "";
  const previousExit = process.exitCode;
  const stdout = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output += String(chunk);
    return true;
  });
  try {
    process.exitCode = undefined;
    await serve([...argv, "--agent", "--json", "--full-output", ...(approval ? ["--yes"] : [])]);
    return { result: JSON.parse(output), exitCode: process.exitCode ?? 0 };
  } finally {
    stdout.mockRestore();
    process.exitCode = previousExit;
  }
}

const pageInfo = { hasNextPage: false, endCursor: null };
const customer = { id: "customer-1", name: "Acme", externalId: null, description: "" };
const user = {
  id: "user-1",
  name: "Pat",
  email: "pat@example.com",
  externalId: null,
  role: { name: "Member" },
};
const role = { id: "role-1", name: "Member", description: "Customer member" };
const mutations = [
  {
    route: ["customers", "create"],
    args: ["--name", "Acme"],
    field: "createCustomer",
    response: { customer: { id: "customer-1" }, errors: [] },
    output: { customerId: "customer-1" },
    variables: { name: "Acme" },
    code: "CUSTOMER_CREATE_FAILED",
  },
  {
    route: ["customers", "update"],
    args: ["customer-1", "--description", ""],
    field: "updateCustomer",
    response: { customer: { id: "customer-1" }, errors: [] },
    output: { customerId: "customer-1" },
    variables: { id: "customer-1", description: "" },
    code: "CUSTOMER_UPDATE_FAILED",
  },
  {
    route: ["customers", "delete"],
    args: ["customer-1"],
    field: "deleteCustomer",
    response: { customer: null, errors: [] },
    output: { customerId: "customer-1", deleted: true },
    variables: { id: "customer-1" },
    code: "CUSTOMER_DELETE_FAILED",
  },
  {
    route: ["customers", "users", "create"],
    args: ["--email", "pat@example.com", "--role", "role-1", "--customer", "customer-1"],
    field: "createCustomerUser",
    response: { user: { id: "user-1" }, errors: [] },
    output: { userId: "user-1" },
    variables: { email: "pat@example.com", role: "role-1", customer: "customer-1" },
    code: "CUSTOMER_USERS_CREATE_FAILED",
  },
  {
    route: ["customers", "users", "update"],
    args: ["user-1", "--dark-mode", "false", "--phone", ""],
    field: "updateUser",
    response: { user: { id: "user-1" }, errors: [] },
    output: { userId: "user-1" },
    variables: { user: "user-1", darkMode: false, phone: "" },
    code: "CUSTOMER_USERS_UPDATE_FAILED",
  },
  {
    route: ["customers", "users", "delete"],
    args: ["user-1"],
    field: "deleteUser",
    response: { user: null, errors: [] },
    output: { userId: "user-1", deleted: true },
    variables: { id: "user-1" },
    code: "CUSTOMER_USERS_DELETE_FAILED",
  },
];

describe.each(mutations)("customer mutation $field", ({
  route,
  args,
  field,
  response,
  output,
  variables,
  code,
}) => {
  it("returns a confirmed result and sends the intended variables", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({ [field]: response });
    const actual = await invoke([...route, ...args, "--profile", "QA Team"]);
    expect(actual.exitCode).toBe(0);
    expect(actual.result.data).toEqual(output);
    expect(gqlRequest).toHaveBeenCalledOnce();
    expect(gqlRequest).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining(variables) }),
    );
    expect(actual.result.meta.cta.commands[0].command).toContain("--profile 'QA Team'");
  });
  it("requires approval before issuing the mutation", async () => {
    const actual = await invoke([...route, ...args], false);
    expect(actual.exitCode).toBe(2);
    expect(actual.result.error.code).toBe("CONFIRMATION_REQUIRED");
    expect(gqlRequest).not.toHaveBeenCalled();
  });
  it("honors read-only mode even with approval", async () => {
    const actual = await invoke([...route, ...args, "--read-only"]);
    expect(actual.exitCode).toBe(2);
    expect(actual.result.error.code).toBe("READ_ONLY");
    expect(gqlRequest).not.toHaveBeenCalled();
  });
  it("does not report success for an absent mutation payload", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({ [field]: null });
    const actual = await invoke([...route, ...args]);
    expect(actual.exitCode).toBe(1);
    expect(actual.result).toMatchObject({ ok: false, error: { code, retryable: false } });
    expect(actual.result.meta.cta.commands).not.toHaveLength(0);
  });
  it("does not encourage blindly retrying an ambiguous network failure", async () => {
    vi.mocked(gqlRequest).mockRejectedValue(
      new Error("Network request to API failed: connection reset"),
    );
    const actual = await invoke([...route, ...args]);
    expect(actual.exitCode).toBe(1);
    expect(actual.result.error).toMatchObject({
      code,
      retryable: false,
      message: expect.stringContaining("connection reset"),
    });
  });
});

it.for([
  ["customers", "create", "--name", " "],
  ["customers", "create", "--name", "Acme", "--label", ""],
  ["customers", "update", "customer-1"],
  ["customers", "update", "customer-1", "--name", " "],
  ["customers", "update", " ", "--description", "test"],
  ["customers", "delete", " "],
  [
    "customers",
    "users",
    "create",
    "--email",
    "not-an-email",
    "--role",
    "role-1",
    "--customer",
    "customer-1",
  ],
  [
    "customers",
    "users",
    "create",
    "--email",
    "pat@example.com",
    "--role",
    "",
    "--customer",
    "customer-1",
  ],
  [
    "customers",
    "users",
    "create",
    "--email",
    "pat@example.com",
    "--role",
    "role-1",
    "--customer",
    " ",
  ],
  ["customers", "users", "update", "user-1"],
  ["customers", "users", "update", "user-1", "--dark-mode", "yes"],
  ["customers", "users", "update", "user-1", "--dark-mode-os-sync", "0"],
  ["customers", "users", "delete", ""],
  ["customers", "users", "list", " "],
  ["customers", "list", "--first", "0"],
  ["customers", "users", "list", "customer-1", "--first", "1.5"],
])("rejects invalid inputs before API work: %j", async (argv) => {
  const actual = await invoke(argv);
  expect(actual.exitCode, JSON.stringify(actual.result)).toBe(2);
  expect(gqlRequest).not.toHaveBeenCalled();
});

const lists = [
  {
    route: ["customers", "list"],
    response: { customers: { nodes: [customer], pageInfo } },
    output: { items: [customer], pageInfo },
  },
  {
    route: ["customers", "users", "list", "customer-1"],
    response: { customer: { users: { nodes: [user], pageInfo } } },
    output: { items: [{ ...user, role: "Member" }], pageInfo },
  },
  {
    route: ["customers", "users", "roles"],
    response: { customerRoles: [null, role] },
    output: { items: [role] },
  },
];

describe.each(lists)("customer listing $route", ({ route, response, output }) => {
  it("returns typed rows, retaining null values", async () => {
    vi.mocked(gqlRequest).mockResolvedValue(response);
    const actual = await invoke(route, false);
    expect(actual.exitCode).toBe(0);
    expect(actual.result.data).toEqual(output);
    expect(actual.result.meta?.cta).toBeUndefined();
  });
  it("projects selected columns", async () => {
    vi.mocked(gqlRequest).mockResolvedValue(response);
    const actual = await invoke([...route, "--columns", "id"]);
    expect(actual.result.data.items).toEqual(output.items.map(({ id }) => ({ id })));
  });
  it("marks transient read failures retryable", async () => {
    vi.mocked(gqlRequest).mockRejectedValue(
      new ClientError(
        { status: 503, headers: {}, errors: [{ message: "Service unavailable" }] },
        { query: "query" },
      ),
    );
    const actual = await invoke(route);
    expect(actual.exitCode).toBe(1);
    expect(actual.result.error).toMatchObject({ retryable: true, message: "Service unavailable" });
  });
});

it("distinguishes a missing customer from an existing customer with no users", async () => {
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({ customer: null })
    .mockResolvedValueOnce({ customer: { users: { nodes: [], pageInfo } } });
  const missing = await invoke(["customers", "users", "list", "missing"]);
  expect(missing.result.error.code).toBe("NOT_FOUND");
  const empty = await invoke(["customers", "users", "list", "customer-1"]);
  expect(empty.result.data).toEqual({ items: [], pageInfo });
});

it("provides a scoped customer-user continuation and fetches all pages explicitly", async () => {
  const first = {
    customer: { users: { nodes: [user], pageInfo: { hasNextPage: true, endCursor: "next" } } },
  };
  const last = { customer: { users: { nodes: [{ ...user, id: "user-2" }], pageInfo } } };
  vi.mocked(gqlRequest).mockResolvedValueOnce(first);
  const result = await invoke([
    "customers",
    "users",
    "list",
    "customer-1",
    "--first",
    "1",
    "--columns",
    "id",
    "--profile",
    "staging",
  ]);
  expect(result.result.meta.cta.commands[0].command).toBe(
    "prism customers users list customer-1 --after next --first 1 --columns id --profile staging",
  );
  vi.mocked(gqlRequest).mockResolvedValueOnce(first).mockResolvedValueOnce(last);
  const all = await invoke(["customers", "users", "list", "customer-1", "--all", "--first", "1"]);
  expect(all.result.data.items).toHaveLength(2);
  expect(all.result.meta?.cta).toBeUndefined();
  expect(gqlRequest).toHaveBeenLastCalledWith(
    expect.objectContaining({ variables: { id: "customer-1", after: "next", first: 1 } }),
  );
});

it.each([null, "repeat"])("rejects a non-advancing pagination cursor %j", async (endCursor) => {
  vi.mocked(gqlRequest).mockResolvedValue({
    customers: { nodes: [], pageInfo: { hasNextPage: true, endCursor } },
  });
  const result = await invoke(["customers", "list", "--all", "--after", "repeat"]);
  expect(result.exitCode).toBe(1);
  expect(result.result.error.code).toBe("PAGINATION_ERROR");
  expect(gqlRequest).toHaveBeenCalledOnce();
});

it("stops a pagination cycle even if the cursor differs from the previous page", async () => {
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({
      customers: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "b" } },
    })
    .mockResolvedValueOnce({
      customers: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "a" } },
    });
  const result = await invoke(["customers", "list", "--all", "--after", "a"]);
  expect(result.result.error.code).toBe("PAGINATION_ERROR");
  expect(gqlRequest).toHaveBeenCalledTimes(2);
});

it("publishes boolean-string constraints in the customer-user MCP schema", () => {
  const [tool] = Mcp.collectTools(
    new Map([["customers users update", Commands["customers:users:update"]]]),
    [],
  );
  expect(tool.inputSchema.properties["dark-mode"]).toMatchObject({
    type: "string",
    enum: ["true", "false"],
  });
});

it("runs the customer command through MCP with per-call approval and profile guidance", async () => {
  const [tool] = Mcp.collectTools(
    new Map([["customers create", Commands["customers:create"]]]),
    [],
  );
  vi.mocked(gqlRequest).mockResolvedValue({
    createCustomer: { customer: { id: "customer-1" }, errors: [] },
  });
  const call = (input: Record<string, unknown>) =>
    runWithMcpTransport(() =>
      Mcp.callTool(tool, input, {
        middlewares: [commandMiddleware],
        vars: commandVars,
        env: environmentOptions,
      }),
    );
  const denied = await call({ name: "Acme" });
  expect(denied.isError).toBe(true);
  expect(gqlRequest).not.toHaveBeenCalled();
  const result = await call({ name: "Acme", context: { yes: true, profile: "staging" } });
  expect(result.isError).not.toBe(true);
  expect(result.structuredContent).toEqual({ customerId: "customer-1" });
  expect(JSON.stringify(result._meta)).toContain("--profile staging");
});

it("allows an explicit empty labels array in MCP to clear labels", async () => {
  const [tool] = Mcp.collectTools(
    new Map([["customers update", Commands["customers:update"]]]),
    [],
  );
  vi.mocked(gqlRequest).mockResolvedValue({
    updateCustomer: { customer: { id: "customer-1" }, errors: [] },
  });
  const result = await runWithMcpTransport(() =>
    Mcp.callTool(
      tool,
      { customer: "customer-1", label: [], context: { yes: true } },
      {
        middlewares: [commandMiddleware],
        vars: commandVars,
        env: environmentOptions,
      },
    ),
  );
  expect(result.isError).not.toBe(true);
  expect(gqlRequest).toHaveBeenCalledWith(
    expect.objectContaining({ variables: expect.objectContaining({ labels: [] }) }),
  );
});

it.each([
  { route: "customers:update", input: { customer: "customer-1" } },
  { route: "customers:users:update", input: { user: "user-1" } },
])("rejects an empty MCP update even when context controls are present: $route", async ({
  route,
  input,
}) => {
  const [tool] = Mcp.collectTools(new Map([[route, Commands[route]]]), []);
  const result = await runWithMcpTransport(() =>
    Mcp.callTool(
      tool,
      { ...input, context: { yes: true, profile: "staging" } },
      {
        middlewares: [commandMiddleware],
        vars: commandVars,
        env: environmentOptions,
      },
    ),
  );
  expect(result.isError).toBe(true);
  expect(gqlRequest).not.toHaveBeenCalled();
});

it.each(lists)("preserves legacy human JSON table output for $route", async ({
  route,
  response,
  output,
}) => {
  vi.mocked(gqlRequest).mockResolvedValue(response);
  let printed = "";
  const previousExit = process.exitCode;
  const stdout = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    printed += String(chunk);
    return true;
  });
  try {
    process.exitCode = undefined;
    await serve([...route, "--no-agent", "--extended", "--output", "json"]);
    expect(process.exitCode ?? 0).toBe(0);
    expect(JSON.parse(printed)).toEqual(
      output.items.map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value ?? ""])),
      ),
    );
  } finally {
    stdout.mockRestore();
    process.exitCode = previousExit;
  }
});

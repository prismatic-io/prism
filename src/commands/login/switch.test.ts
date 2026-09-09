import { beforeEach, expect, it, vi } from "vitest";
import { cli } from "../../cli.js";

const mocks = vi.hoisted(() => ({
  tenants: vi.fn(),
  refresh: vi.fn(),
  selectTenant: vi.fn(),
}));

vi.mock("../../auth.js", () => ({
  getAuthenticatedContext: vi.fn(async () => ({})),
  isLoggedIn: vi.fn(async () => true),
  fetchUserTenants: mocks.tenants,
  refresh: mocks.refresh,
  selectTenant: mocks.selectTenant,
}));
vi.mock("../../context.js", async (original) => ({
  ...(await original()),
  getProfileAuthContext: vi.fn(async () => ({
    profileName: "staging",
    profile: { tenantId: "current" },
  })),
}));

const tenant = (tenantId: string, systemSuspended = false) => ({
  tenantId,
  orgName: tenantId,
  url: "https://example.com",
  systemSuspended,
});

beforeEach(() => {
  mocks.tenants.mockResolvedValue([tenant("current")]);
});

async function invoke(tenantId?: string) {
  const writes: string[] = [];
  let exitCode = 0;
  await cli.serve(
    [
      "login",
      "switch",
      ...(tenantId === undefined ? [] : ["--tenant-id", tenantId]),
      "--agent",
      "--yes",
      "--json",
      "--full-output",
    ],
    {
      stdout: (value) => writes.push(value),
      exit: (code) => {
        exitCode = code;
      },
    },
  );
  return { result: JSON.parse(writes.join("")), exitCode };
}

it.each([
  [],
  [tenant("current")],
  [tenant("current"), tenant("another")],
  [tenant("current"), tenant("unavailable", true)],
])("rejects unavailable tenant selection with tenants %j", async (...tenants) => {
  mocks.tenants.mockResolvedValue(tenants);
  const { result, exitCode } = await invoke("unavailable");
  expect(exitCode).toBe(2);
  expect(result).toMatchObject({
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      retryable: false,
      message: "Tenant 'unavailable' is not available to this profile.",
    },
  });
  expect(mocks.refresh).not.toHaveBeenCalled();
  expect(mocks.selectTenant).not.toHaveBeenCalled();
});

it.each([
  undefined,
  "current",
])("keeps the current sole tenant for selection %j", async (selection) => {
  const { result, exitCode } = await invoke(selection);
  expect(exitCode).toBe(0);
  expect(result).toMatchObject({ ok: true, data: { tenantId: "current", switched: false } });
  expect(mocks.refresh).not.toHaveBeenCalled();
  expect(mocks.selectTenant).not.toHaveBeenCalled();
});

it("honors an explicit selection of the sole available tenant when the stored tenant differs", async () => {
  mocks.tenants.mockResolvedValue([tenant("available")]);
  const { result, exitCode } = await invoke("available");
  expect(exitCode).toBe(0);
  expect(result).toMatchObject({ ok: true, data: { tenantId: "available", switched: true } });
  expect(mocks.refresh).toHaveBeenCalledWith("available");
  expect(mocks.selectTenant).not.toHaveBeenCalled();
});

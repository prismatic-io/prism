import { afterEach, describe, expect, it, vi } from "vitest";
import inquirer from "inquirer";
import { Authenticate, createRequestParams, selectTenant, type Tenant } from "./auth.js";
import { deleteConfig } from "./config.js";
import { fetch } from "./utils/http.js";

vi.unmock("./auth.js");

vi.mock("./config.js", () => ({
  configFileExists: vi.fn(),
  deleteConfig: vi.fn(),
  readConfig: vi.fn(),
  writeConfig: vi.fn(),
}));

vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(),
  },
}));

const makeTenant = (id: string, overrides: Partial<Tenant> = {}): Tenant => ({
  tenantId: id,
  url: `https://${id}.example.com`,
  orgName: `Org ${id}`,
  awsRegion: "us-west-2",
  systemSuspended: false,
  ...overrides,
});

const domain = "prismatic-io-dev.auth0.com";
const clientId = "R3uA27LbxqyanGVXjKpXgQo5A4TK44s7";
const audience = "https://prismatic.io/api";
const successRedirectUri = "https://prismatic.io";

describe("createRequestParams", () => {
  it("handles empty collection", () => {
    expect(createRequestParams({})).toBe("");
  });

  it("handles collection with one item", () => {
    const input = { someId: "123456:7890" };
    const expected = "someId=123456%3A7890";
    expect(createRequestParams(input)).toStrictEqual(expected);
  });

  it("handles collection with more than one item", () => {
    const input = { hello: "world", another: "17" };
    const expected = "hello=world&another=17";
    expect(createRequestParams(input)).toStrictEqual(expected);
  });

  it("should not start with question mark", () => {
    // This is due to the reuse of the method for form data
    const [firstCharacter] = createRequestParams({ foo: "bar" });
    expect(firstCharacter).not.toBe("?");
  });
});

describe("selectTenant", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("logs an error and returns undefined when every tenant is suspended", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const tenants = [
      makeTenant("a", { systemSuspended: true }),
      makeTenant("b", { systemSuspended: true }),
    ];

    const result = await selectTenant(tenants, { currentTenantId: "a" });

    expect(result).toBeUndefined();
    expect(inquirer.prompt).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("no active tenants"));
  });

  it("deletes the config when the current tenant is suspended", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ tenantId: "b" });
    const tenants = [makeTenant("a", { systemSuspended: true }), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(deleteConfig).toHaveBeenCalledOnce();
  });

  it("does not delete the config when the current tenant is active", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ tenantId: "a" });
    const tenants = [makeTenant("a"), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(deleteConfig).not.toHaveBeenCalled();
  });

  it("filters suspended tenants out of the choice list", async () => {
    let capturedChoices: Array<{ value: string }> = [];
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedChoices = (questions as Array<{ choices: typeof capturedChoices }>)[0].choices;
      return { tenantId: "b" };
    });
    const tenants = [
      makeTenant("a", { systemSuspended: true }),
      makeTenant("b"),
      makeTenant("c", { systemSuspended: true }),
      makeTenant("d"),
    ];

    await selectTenant(tenants);

    expect(capturedChoices.map((c) => c.value)).toEqual(["b", "d"]);
  });

  it("omits the suspended current tenant from the prompt default", async () => {
    let capturedDefault: string | undefined;
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedDefault = (questions as Array<{ default?: string }>)[0].default;
      return { tenantId: "b" };
    });
    const tenants = [makeTenant("a", { systemSuspended: true }), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(capturedDefault).toBeUndefined();
  });

  it("passes the active current tenant through as the prompt default", async () => {
    let capturedDefault: string | undefined;
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedDefault = (questions as Array<{ default?: string }>)[0].default;
      return { tenantId: "a" };
    });
    const tenants = [makeTenant("a"), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(capturedDefault).toBe("a");
  });
});

// Skip the auth tests since they're more for convenience testing auth
// rather than actual good unit tests to run due to their side effects.
describe.skip("auth", () => {
  it("should work", async () => {
    expect.assertions(1);
    const auth = new Authenticate({
      domain,
      clientId,
      audience,
      scopes: ["token", "email"],
      successRedirectUri,
    });
    const response = await auth.login();
    expect(response.accessToken).toBeDefined();
  });

  it("should retrieve email", async () => {
    expect.assertions(1);
    const auth = new Authenticate({
      domain,
      clientId,
      audience,
      scopes: ["token", "openid", "email", "offline_access"],
      successRedirectUri,
    });
    const { accessToken } = await auth.login();
    const response = await fetch(`https://${domain}/userinfo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    expect(data.email).toBeDefined();
  });
});

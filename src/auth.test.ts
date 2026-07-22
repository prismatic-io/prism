import { describe, expect, it, vi } from "vitest";
import inquirer from "inquirer";
import {
  Authenticate,
  createRequestParams,
  getAccessToken,
  login,
  selectTenant,
  type Tenant,
} from "./auth.js";
import { deleteProfile, readProfileSelection, writeActiveProfile } from "./config.js";
import { getAuthContext } from "./context.js";
import { gqlRequest } from "./graphql.js";
import { fetch } from "./utils/http.js";

vi.unmock("./auth.js");

vi.mock(import("./config.js"), () => ({
  deleteProfile: vi.fn(),
  getActiveProfileName: vi.fn(),
  readProfile: vi.fn(),
  readProfileSelection: vi.fn(),
  writeActiveProfile: vi.fn(),
}));

vi.mock(import("./context.js"), () => ({
  getAuthContext: vi.fn(),
  useProfileAuthContext: vi.fn(),
  getPrismaticUrl: vi.fn(() => Promise.resolve("https://auth.example.com")),
}));

vi.mock(import("./graphql.js"), () => ({
  gql: (strings: TemplateStringsArray) => strings.join(""),
  gqlRequest: vi.fn(),
}));

vi.mock(import("inquirer"), () => ({
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

describe("getAccessToken", () => {
  const tokenExpiringAt = (exp: number) =>
    [
      Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
      Buffer.from(JSON.stringify({ exp })).toString("base64url"),
      "signature",
    ].join(".");

  it("refreshes an expired environment token without persisting it", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "environment",
      url: "https://auth.example.com",
      accessToken: tokenExpiringAt(0),
      refreshToken: "env-refresh-token",
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
      )
      .mockResolvedValueOnce(
        Response.json({
          access_token: "refreshed-access-token",
          expires_in: 3600,
          token_type: "Bearer",
        }),
      );

    await expect(getAccessToken()).resolves.toBe("refreshed-access-token");

    const refreshRequest = fetchSpy.mock.calls[1];
    expect(refreshRequest[0].toString()).toBe("https://auth.example.com/oauth/token");
    expect(refreshRequest[1]?.body).toBe(
      "grant_type=refresh_token&client_id=client&refresh_token=env-refresh-token",
    );
    expect(writeActiveProfile).not.toHaveBeenCalled();
  });

  it("does not persist a session obtained from an environment refresh token", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "environment",
      url: "https://auth.example.com",
      refreshToken: "env-refresh-token",
      tenantId: "env-tenant",
    });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
      )
      .mockResolvedValueOnce(
        Response.json({
          access_token: "refreshed-access-token",
          expires_in: 3600,
          token_type: "Bearer",
        }),
      );

    await expect(getAccessToken()).resolves.toBe("refreshed-access-token");

    expect(readProfileSelection).not.toHaveBeenCalled();
    expect(fetchSpy.mock.calls[1][1]?.body).toBe(
      "grant_type=refresh_token&client_id=client&refresh_token=env-refresh-token&tenant_id=env-tenant",
    );
    expect(writeActiveProfile).not.toHaveBeenCalled();
  });

  it("returns a valid profile access token without refreshing it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const accessToken = tokenExpiringAt(Math.floor(Date.now() / 1000) + 600);
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "profile",
      profileName: "staging",
      url: "https://staging.example.com",
      accessToken,
      refreshToken: "profile-refresh-token",
      tenantId: "profile-tenant",
    });

    await expect(getAccessToken()).resolves.toBe(accessToken);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(writeActiveProfile).not.toHaveBeenCalled();
  });

  it("refreshes an expired profile token into the same profile", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "profile",
      profileName: "staging",
      url: "https://staging.example.com",
      accessToken: tokenExpiringAt(0),
      refreshToken: "profile-refresh-token",
      tenantId: "profile-tenant",
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
      )
      .mockResolvedValueOnce(
        Response.json({
          access_token: "refreshed-profile-token",
          expires_in: 3600,
          scope: "openid",
          token_type: "Bearer",
        }),
      );

    await expect(getAccessToken()).resolves.toBe("refreshed-profile-token");

    expect(writeActiveProfile).toHaveBeenCalledWith(
      {
        accessToken: "refreshed-profile-token",
        expiresIn: 3600,
        refreshToken: "profile-refresh-token",
        scope: "openid",
        tokenType: "Bearer",
        tenantId: "profile-tenant",
      },
      "staging",
    );
  });

  it("returns an environment access token without borrowing a profile refresh token", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "environment",
      url: "https://ci.example.com",
      accessToken: "opaque-ci-token",
    });

    await expect(getAccessToken()).resolves.toBe("opaque-ci-token");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(readProfileSelection).not.toHaveBeenCalled();
    expect(writeActiveProfile).not.toHaveBeenCalled();
  });
});

describe("login", () => {
  const initialAuth = {
    accessToken: "initial-access",
    expiresIn: 3600,
    refreshToken: "initial-refresh",
    scope: "openid",
    tokenType: "Bearer",
  };

  const mockLogin = (tenants: Tenant[], tenantId: string) => {
    vi.spyOn(Authenticate.prototype, "login").mockResolvedValue(initialAuth);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
    );
    vi.mocked(gqlRequest)
      .mockResolvedValueOnce({ listUserTenants: { nodes: tenants } })
      .mockResolvedValueOnce({
        authenticatedUser: {
          name: "User",
          email: "user@example.com",
          tenantId,
          org: { id: "org-1", name: "Org" },
          customer: undefined,
        },
      });
  };

  it("writes every authentication update to the selected profile", async () => {
    mockLogin([makeTenant("tenant-1")], "tenant-1");

    await login({ url: false, profileName: "staging" });

    expect(writeActiveProfile).toHaveBeenNthCalledWith(1, initialAuth, "staging");
    expect(writeActiveProfile).toHaveBeenNthCalledWith(
      2,
      { ...initialAuth, tenantId: "tenant-1" },
      "staging",
    );
    expect(deleteProfile).not.toHaveBeenCalled();
  });

  it("deletes the selected profile when its tenant is suspended and none are active", async () => {
    mockLogin([makeTenant("suspended", { systemSuspended: true })], "suspended");

    await login({ url: false, profileName: "staging" });

    expect(deleteProfile).toHaveBeenCalledWith("staging");
  });

  it("retains the profile when a suspended tenant is replaced with an active one", async () => {
    const refreshedAuth = { ...initialAuth, accessToken: "refreshed", tenantId: "active" };
    mockLogin(
      [makeTenant("suspended", { systemSuspended: true }), makeTenant("active")],
      "suspended",
    );
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ tenantId: "active" });
    vi.spyOn(Authenticate.prototype, "refresh").mockResolvedValueOnce(refreshedAuth);

    await login({ url: false, profileName: "staging" });

    expect(writeActiveProfile).toHaveBeenLastCalledWith(refreshedAuth, "staging");
    expect(deleteProfile).not.toHaveBeenCalled();
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

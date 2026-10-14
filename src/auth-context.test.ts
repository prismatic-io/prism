import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Authenticate, getAccessToken, getAuthenticatedContext, login } from "./auth.js";
import { createCommandContext, runWithCommandContext } from "./command-context.js";
import type { Configuration as Credentials, Profile } from "./config.js";
import {
  deleteProfile,
  readConfigFile,
  replaceCredentials,
  useProfile,
  writeProfile,
} from "./config.js";
import {
  deleteAuthProfile,
  getAuthContext,
  getProfileAuthContext,
  saveProfileCredentials,
} from "./context.js";
import { gqlRequest } from "./graphql.js";

vi.unmock("./auth.js");
vi.unmock("./context.js");

const profile: Profile = {
  accessToken: `e30.${Buffer.from(JSON.stringify({ exp: 0 })).toString("base64url")}.signature`,
  refreshToken: "refresh-original",
  expiresIn: 3600,
  scope: "openid",
  tokenType: "Bearer",
  tenantId: "original-tenant",
  prismaticUrl: "https://original.example.com",
};
const refreshed: Credentials = { ...profile, accessToken: "fresh-token" };

const pauseRefresh = () => {
  const started = Promise.withResolvers<void>();
  const response = Promise.withResolvers<Credentials>();
  vi.spyOn(Authenticate.prototype, "refresh").mockImplementation(async () => {
    started.resolve();
    return response.promise;
  });
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    if (String(input).endsWith("/auth/meta")) {
      return Response.json({
        domain: "auth.example.com",
        clientId: "client",
        audience: "audience",
      });
    }
    return Response.json({ data: { ok: true } });
  });
  return { started: started.promise, finish: () => response.resolve(refreshed) };
};

it("requires the caller to establish an auth session", async () => {
  expect(() => getAuthContext()).toThrow("active command session");
  expect(() => getAuthenticatedContext()).toThrow("active command session");
  await expect(login({ url: false })).rejects.toThrow("active command session");
});

describe("authentication and saved profile lifecycle", () => {
  let directory: string;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "prism-auth-context-"));
    vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "config.yml"));
    for (const name of [
      "PRISM_ACCESS_TOKEN",
      "PRISM_REFRESH_TOKEN",
      "PRISM_PROFILE",
      "PRISMATIC_URL",
      "PRISMATIC_TENANT_ID",
    ])
      vi.stubEnv(name, "");
    await writeProfile("original", profile);
  });
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it.each([
    "delete",
    "new login",
    "tenant switch",
  ])("rejects refresh after a concurrent %s", async (change) => {
    const paused = pauseRefresh();
    const pending = runWithCommandContext(createCommandContext(), getAuthenticatedContext);
    const rejected = expect(pending).rejects.toThrow(/changed while authenticating/);
    await paused.started;
    const configPath = process.env.PRISM_CONFIG_FILE;
    if (change === "delete") await deleteProfile("original");
    else
      await writeProfile("original", {
        ...profile,
        accessToken: "newer-token",
        tenantId: change === "tenant switch" ? "new-tenant" : profile.tenantId,
      });
    const expected = await readConfigFile(configPath);
    paused.finish();
    await rejected;
    expect(await readConfigFile(configPath)).toEqual(expected);
  });

  it("keeps the request token and endpoint together when the default changes during refresh", async () => {
    const configPath = process.env.PRISM_CONFIG_FILE;
    await writeProfile("other", { ...profile, prismaticUrl: "https://other.example.com" });
    const paused = pauseRefresh();
    const pending = runWithCommandContext(createCommandContext(), () =>
      gqlRequest({ document: "query { ok }" }),
    );
    await paused.started;
    await useProfile("other");
    paused.finish();
    await expect(pending).resolves.toEqual({ ok: true });
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "https://original.example.com/api",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer fresh-token" }),
      }),
    );
    expect((await readConfigFile(configPath))?.defaultProfile).toBe("other");
  });

  it("commits refresh to the original file when the configured path changes", async () => {
    const configPath = process.env.PRISM_CONFIG_FILE;
    const paused = pauseRefresh();
    const pending = runWithCommandContext(createCommandContext(), getAuthenticatedContext);
    await paused.started;
    vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "other.yml"));
    paused.finish();
    await pending;
    expect((await readConfigFile(configPath))?.profiles.original.accessToken).toBe("fresh-token");
    expect(await readConfigFile()).toBeNull();
  });
  it("compares optional tenant values and preserves the saved endpoint", async () => {
    const { tenantId: _tenant, ...withoutTenant } = profile;
    await writeProfile("original", withoutTenant);
    expect(
      await replaceCredentials("original", { ...withoutTenant, tenantId: undefined }, refreshed),
    ).toBe(true);
    expect((await readConfigFile())?.profiles.original).toEqual({
      ...refreshed,
      prismaticUrl: profile.prismaticUrl,
    });
    expect(await replaceCredentials("original", withoutTenant, refreshed)).toBe(false);
  });

  it("accepts the same profile with reordered properties", async () => {
    const reordered = Object.fromEntries(Object.entries(profile).reverse()) as Profile;
    expect(await replaceCredentials("original", reordered, refreshed)).toBe(true);
  });

  it.each([
    { accessToken: "new-access" },
    { refreshToken: "new-refresh" },
    { expiresIn: 7200 },
    { scope: "new-scope" },
    { tokenType: "new-type" },
    { prismaticUrl: "https://other.example.com" },
    { tenantId: "new-tenant" },
  ])("rejects stale credentials after profile fields change: %j", async (change) => {
    const current = { ...profile, ...change };
    await writeProfile("original", current);
    expect(await replaceCredentials("original", profile, refreshed)).toBe(false);
    expect((await readConfigFile())?.profiles.original).toEqual(current);
  });

  it("shares a refresh among parallel requests and reuses the refreshed session", async () => {
    const freshToken = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
    const paused = pauseRefresh();
    const refreshSpy = vi.mocked(Authenticate.prototype.refresh);
    await runWithCommandContext(createCommandContext(), async () => {
      const requests = Promise.all([getAccessToken(), getAccessToken(), getAccessToken()]);
      await paused.started;
      // Supply a valid fresh token so later calls can check its expiration normally.
      refreshed.accessToken = freshToken;
      paused.finish();
      try {
        expect(await requests).toEqual([freshToken, freshToken, freshToken]);
        expect(await getAccessToken()).toBe(freshToken);
        expect((await getAuthContext()).accessToken).toBe(freshToken);
        expect(refreshSpy).toHaveBeenCalledOnce();
      } finally {
        refreshed.accessToken = "fresh-token";
      }
    });
  });

  it("retains the invocation environment even before lazy auth resolution", async () => {
    const command = createCommandContext({ profileName: "original" });
    vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "other.yml"));
    vi.stubEnv("PRISM_ACCESS_TOKEN", "other-token");
    await runWithCommandContext(command, async () => {
      expect(await getAuthContext()).toMatchObject({
        source: "profile",
        profileName: "original",
        url: profile.prismaticUrl,
      });
    });
  });

  it("updates the session after tenant changes and logout", async () => {
    await runWithCommandContext(createCommandContext({ profileOnly: true }), async () => {
      await getAuthContext();
      await saveProfileCredentials({ ...profile, tenantId: "switched" });
      expect((await getAuthContext()).tenantId).toBe("switched");
      const { tenantId: _tenant, ...credentials } = profile;
      await saveProfileCredentials(credentials);
      expect((await getAuthContext()).tenantId).toBeUndefined();
      expect((await getProfileAuthContext()).profile?.tenantId).toBeUndefined();
      await deleteAuthProfile();
      expect(await getAuthContext()).toMatchObject({
        source: "profile",
        profile: null,
        accessToken: undefined,
      });
    });
  });

  it("uses newly logged-in credentials for follow-up queries in the same command", async () => {
    const accessToken = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
    vi.spyOn(Authenticate.prototype, "login").mockResolvedValue({ ...refreshed, accessToken });
    const requests: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input).endsWith("/auth/meta"))
        return Response.json({
          domain: "auth.example.com",
          clientId: "client",
          audience: "audience",
        });
      requests.push(new Headers(init?.headers).get("Authorization") ?? "");
      if (String(init?.body).includes("listUserTenants"))
        return Response.json({
          data: {
            listUserTenants: {
              nodes: [
                {
                  tenantId: "selected",
                  orgName: "Org",
                  url: "https://org.example.com",
                  awsRegion: "us-east-1",
                  systemSuspended: false,
                },
              ],
            },
          },
        });
      return Response.json({
        data: {
          authenticatedUser: {
            name: "User",
            email: "user@example.com",
            tenantId: "selected",
            org: { id: "org", name: "Org" },
          },
        },
      });
    });
    await runWithCommandContext(createCommandContext({ profileOnly: true }), async () => {
      await login({ url: false });
      expect((await getAuthContext()).tenantId).toBe("selected");
      expect(await getAccessToken()).toBe(accessToken);
    });
    expect(requests).toEqual([`Bearer ${accessToken}`, `Bearer ${accessToken}`]);
  });
});

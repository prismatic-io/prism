import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Authenticate, getAuthenticatedContext, refresh } from "./auth.js";
import type { Credentials, Profile } from "./config.js";
import { getConfigStore } from "./context.js";
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
    await getConfigStore().saveProfile("original", profile);
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
    const pending = getAuthenticatedContext();
    const rejected = expect(pending).rejects.toThrow(/changed while authenticating/);
    await paused.started;
    const store = getConfigStore();
    if (change === "delete") await store.deleteProfile("original");
    else
      await store.saveProfile("original", {
        ...profile,
        accessToken: "newer-token",
        tenantId: change === "tenant switch" ? "new-tenant" : profile.tenantId,
      });
    const expected = await store.read();
    paused.finish();
    await rejected;
    expect(await store.read()).toEqual(expected);
  });

  it("keeps the request token and endpoint together when the default changes during refresh", async () => {
    const store = getConfigStore();
    await store.saveProfile("other", { ...profile, prismaticUrl: "https://other.example.com" });
    const paused = pauseRefresh();
    const pending = gqlRequest({ document: "query { ok }" });
    await paused.started;
    await store.setDefaultProfile("other");
    paused.finish();
    await expect(pending).resolves.toEqual({ ok: true });
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "https://original.example.com/api",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer fresh-token" }),
      }),
    );
    expect((await store.read())?.defaultProfile).toBe("other");
  });

  it("allows a refreshed target without a tenant to be used for a subsequent tenant switch", async () => {
    const { tenantId: _tenantId, ...withoutTenant } = profile;
    await getConfigStore().saveProfile("original", withoutTenant);
    const refreshedWithoutTenant = {
      ...withoutTenant,
      accessToken: "fresh-token",
      tenantId: undefined,
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
    );
    vi.spyOn(Authenticate.prototype, "refresh")
      .mockResolvedValueOnce(refreshedWithoutTenant)
      .mockResolvedValueOnce({
        ...refreshedWithoutTenant,
        accessToken: "tenant-token",
        tenantId: "selected-tenant",
      });
    const context = await getAuthenticatedContext();
    expect(context.source).toBe("profile");
    if (context.source !== "profile") throw new Error("Expected stored profile authentication");
    await refresh(context, "selected-tenant");
    expect((await getConfigStore().read())?.profiles.original).toMatchObject({
      accessToken: "tenant-token",
      tenantId: "selected-tenant",
    });
  });

  it("commits refresh to the original file when the configured path changes", async () => {
    const store = getConfigStore();
    const paused = pauseRefresh();
    const pending = getAuthenticatedContext();
    await paused.started;
    vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "other.yml"));
    paused.finish();
    await pending;
    expect((await store.read())?.profiles.original.accessToken).toBe("fresh-token");
    expect(await getConfigStore().read()).toBeNull();
  });
});

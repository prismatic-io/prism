import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Authenticate, getAuthenticatedContext } from "./auth.js";
import type { Configuration as Credentials, Profile } from "./config.js";
import {
  deleteProfile,
  readConfigFile,
  replaceCredentials,
  selectProfile,
  useProfile,
  writeProfile,
} from "./config.js";
import { useDefaultAuthContext } from "./context.js";
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
    selectProfile(undefined);
    useDefaultAuthContext();
    await writeProfile("original", profile);
  });
  afterEach(async () => {
    selectProfile(undefined);
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
    const pending = gqlRequest({ document: "query { ok }" });
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
    const pending = getAuthenticatedContext();
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
});

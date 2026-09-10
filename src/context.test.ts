import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Profile } from "./config.js";
import {
  getAuthContext,
  getConfigStore,
  getPrismaticUrl,
  selectProfile,
  useDefaultAuthContext,
  useProfileAuthContext,
} from "./context.js";
import { DEFAULT_PRISMATIC_URL } from "./env.js";

vi.unmock("./context.js");

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  accessToken: "access",
  expiresIn: 3600,
  refreshToken: "refresh",
  scope: "openid profile email",
  tokenType: "Bearer",
  prismaticUrl: DEFAULT_PRISMATIC_URL,
  ...overrides,
});

describe("profile context", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-context-test-"));
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    configPath = path.join(tmpDir, "config.yml");
    vi.stubEnv("PRISM_CONFIG_FILE", configPath);
    vi.stubEnv("PRISMATIC_URL", "");
    vi.stubEnv("PRISMATIC_TENANT_ID", "");
    vi.stubEnv("PRISM_PROFILE", "");
    vi.stubEnv("PRISM_ACCESS_TOKEN", "");
    vi.stubEnv("PRISM_REFRESH_TOKEN", "");
    selectProfile(undefined);
    useDefaultAuthContext();
  });

  afterEach(async () => {
    selectProfile(undefined);
    vi.unstubAllEnvs();
    await rm(configPath, { force: true });
  });

  it("uses the default URL without a profile or environment override", async () => {
    expect(await getPrismaticUrl()).toBe(DEFAULT_PRISMATIC_URL);
  });

  it("uses the selected profile URL", async () => {
    await getConfigStore().saveProfile("default", makeProfile());
    await getConfigStore().saveProfile(
      "staging",
      makeProfile({ prismaticUrl: "https://staging.example.io" }),
    );
    selectProfile("staging");

    expect(await getPrismaticUrl()).toBe("https://staging.example.io");
  });

  it("rejects a URL that conflicts with stored profile credentials", async () => {
    await getConfigStore().saveProfile(
      "default",
      makeProfile({ prismaticUrl: "https://stored.example.io" }),
    );
    vi.stubEnv("PRISMATIC_URL", "https://other.example.io");

    await expect(getPrismaticUrl()).rejects.toThrow(/does not match profile 'default'/);
  });

  it("accepts a matching URL override", async () => {
    await getConfigStore().saveProfile(
      "default",
      makeProfile({ prismaticUrl: "https://stored.example.io" }),
    );
    vi.stubEnv("PRISMATIC_URL", "https://stored.example.io");

    expect(await getPrismaticUrl()).toBe("https://stored.example.io");
  });

  it("uses the environment URL with environment credentials", async () => {
    await getConfigStore().saveProfile(
      "default",
      makeProfile({ prismaticUrl: "https://stored.example.io" }),
    );
    vi.stubEnv("PRISMATIC_URL", "https://ci.example.io");
    vi.stubEnv("PRISM_ACCESS_TOKEN", "ci-token");

    expect(await getPrismaticUrl()).toBe("https://ci.example.io");
  });

  it("keeps a profile tenant with its profile credentials", async () => {
    await getConfigStore().saveProfile("default", makeProfile({ tenantId: "stored-tenant" }));
    expect((await getAuthContext()).tenantId).toBe("stored-tenant");

    vi.stubEnv("PRISMATIC_TENANT_ID", "env-tenant");
    expect((await getAuthContext()).tenantId).toBe("stored-tenant");

    vi.stubEnv("PRISM_ACCESS_TOKEN", "ci-token");
    expect((await getAuthContext()).tenantId).toBe("env-tenant");
  });

  it("does not borrow a profile tenant for environment credentials", async () => {
    await getConfigStore().saveProfile("default", makeProfile({ tenantId: "stored-tenant" }));
    vi.stubEnv("PRISM_ACCESS_TOKEN", "ci-token");

    expect((await getAuthContext()).tenantId).toBeUndefined();
  });

  it("uses the whole environment credential set instead of mixing it with a profile", async () => {
    await getConfigStore().saveProfile(
      "default",
      makeProfile({
        accessToken: "profile-access",
        refreshToken: "profile-refresh",
        tenantId: "profile-tenant",
        prismaticUrl: "https://profile.example.io",
      }),
    );
    vi.stubEnv("PRISM_ACCESS_TOKEN", "environment-access");

    expect(await getAuthContext()).toMatchObject({
      source: "environment",
      url: DEFAULT_PRISMATIC_URL,
      accessToken: "environment-access",
      refreshToken: undefined,
      tenantId: undefined,
    });
  });

  it("forces profile credentials for profile-management auth flows", async () => {
    await getConfigStore().saveProfile(
      "staging",
      makeProfile({
        accessToken: "profile-access",
        refreshToken: "profile-refresh",
        tenantId: "profile-tenant",
        prismaticUrl: "https://staging.example.io",
      }),
    );
    selectProfile("staging");
    vi.stubEnv("PRISM_ACCESS_TOKEN", "environment-access");
    vi.stubEnv("PRISM_REFRESH_TOKEN", "environment-refresh");
    vi.stubEnv("PRISMATIC_TENANT_ID", "environment-tenant");
    vi.stubEnv("PRISMATIC_URL", "https://environment.example.io");
    useProfileAuthContext();

    expect(await getAuthContext()).toMatchObject({
      source: "profile",
      profileName: "staging",
      url: "https://staging.example.io",
      accessToken: "profile-access",
      refreshToken: "profile-refresh",
      tenantId: "profile-tenant",
    });
  });
});

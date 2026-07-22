import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { logout } from "../auth.js";
import { type Profile, readConfigFile, selectProfile, writeProfile } from "../config.js";
import LogoutCommand from "./logout.js";

const profile: Profile = {
  accessToken: "access",
  expiresIn: 3600,
  refreshToken: "refresh",
  scope: "openid profile email",
  tokenType: "Bearer",
  prismaticUrl: "https://app.prismatic.io",
};

describe("logout", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-logout-test-"));
  });

  afterAll(async () => rm(tmpDir, { recursive: true, force: true }));

  beforeEach(() => {
    configPath = path.join(tmpDir, "config.yml");
    vi.stubEnv("PRISM_CONFIG_FILE", configPath);
    vi.stubEnv("PRISM_PROFILE", "");
    selectProfile(undefined);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(configPath, { force: true });
  });

  it("removes only the original profile during browser logout", async () => {
    await writeProfile("default", profile);
    await writeProfile("staging", { ...profile, prismaticUrl: "https://staging.example.io" });

    await LogoutCommand.run(["--browser"]);

    expect(logout).toHaveBeenCalledOnce();
    const config = await readConfigFile();
    expect(Object.keys(config?.profiles ?? {})).toEqual(["staging"]);
    expect(config?.defaultProfile).toBe("staging");
  });

  it("uses oclif's inherited profile flag without changing the default", async () => {
    await writeProfile("default", profile);
    await writeProfile("staging", { ...profile, prismaticUrl: "https://staging.example.io" });

    await LogoutCommand.run(["--profile", "staging"]);

    const config = await readConfigFile();
    expect(Object.keys(config?.profiles ?? {})).toEqual(["default"]);
    expect(config?.defaultProfile).toBe("default");
  });

  it("warns when environment credentials remain active", async () => {
    await writeProfile("default", profile);
    vi.stubEnv("PRISM_ACCESS_TOKEN", "environment-token");

    await LogoutCommand.run([]);

    await expect(readConfigFile()).resolves.toBeNull();
  });

  it("does not report a successful logout when the profile does not exist", async () => {
    await expect(LogoutCommand.run([])).rejects.toThrow(/does not exist/);
  });
});

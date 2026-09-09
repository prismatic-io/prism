import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getStderr } from "../../vitest.setup.js";
import { logout } from "../auth.js";
import type { Profile } from "../config.js";
import { getConfigStore } from "../context.js";
import { runCommand } from "../test-command.js";
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
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(configPath, { force: true });
  });

  it("removes only the original profile during browser logout", async () => {
    await getConfigStore().saveProfile("default", profile);
    await getConfigStore().saveProfile("staging", {
      ...profile,
      prismaticUrl: "https://staging.example.io",
    });

    const result = await runCommand(LogoutCommand, ["--browser"]);
    expect(result).toEqual({
      profile: "default",
      loggedOut: true,
      environmentCredentialsActive: false,
    });

    expect(logout).toHaveBeenCalledOnce();
    const config = await getConfigStore().read();
    expect(Object.keys(config?.profiles ?? {})).toEqual(["staging"]);
    expect(config?.defaultProfile).toBe("staging");
  });

  it("uses the global profile flag without changing the default", async () => {
    await getConfigStore().saveProfile("default", profile);
    await getConfigStore().saveProfile("staging", {
      ...profile,
      prismaticUrl: "https://staging.example.io",
    });

    const result = await runCommand(LogoutCommand, ["--profile", "staging"]);
    expect(result).toEqual({
      profile: "staging",
      loggedOut: true,
      environmentCredentialsActive: false,
    });

    const config = await getConfigStore().read();
    expect(Object.keys(config?.profiles ?? {})).toEqual(["default"]);
    expect(config?.defaultProfile).toBe("default");
  });

  it("warns when environment credentials remain active", async () => {
    await getConfigStore().saveProfile("default", profile);
    vi.stubEnv("PRISM_ACCESS_TOKEN", "environment-token");

    const result = await runCommand(LogoutCommand, []);
    expect(result).toMatchObject({
      profile: "default",
      loggedOut: true,
      environmentCredentialsActive: true,
      warnings: [expect.stringContaining("Environment credentials")],
    });
    expect(getStderr()).toContain("Environment credentials are still active");
    await expect(getConfigStore().read()).resolves.toBeNull();
  });

  it("does not report a successful logout when the profile does not exist", async () => {
    await expect(runCommand(LogoutCommand, [])).rejects.toThrow(/does not exist/);
  });
});

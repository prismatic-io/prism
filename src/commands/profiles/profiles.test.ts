import { runCommand } from "../../test-command.js";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getStdout, getStderr } from "../../../vitest.setup.js";
import { type Profile, readConfigFile, writeProfile } from "../../config.js";
import ProfilesDeleteCommand from "./delete.js";
import ProfilesListCommand from "./list.js";
import ProfilesUseCommand from "./use.js";

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  accessToken: "access",
  expiresIn: 3600,
  refreshToken: "refresh",
  scope: "openid profile email",
  tokenType: "Bearer",
  prismaticUrl: "https://app.prismatic.io",
  ...overrides,
});

describe("profiles commands", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-profiles-cmd-"));
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    configPath = path.join(tmpDir, "config.yml");
    vi.stubEnv("HOME", tmpDir);
    vi.stubEnv("USERPROFILE", tmpDir);
    vi.stubEnv("PRISM_CONFIG_FILE", configPath);
    vi.stubEnv("PRISM_PROFILE", "");
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(configPath, { force: true });
  });

  describe("profiles:list", () => {
    it("lists profiles and marks the default", async () => {
      await writeProfile("default", makeProfile({ tenantId: "t-1" }));
      await writeProfile("staging", makeProfile({ prismaticUrl: "https://staging.example.io" }));

      await runCommand(ProfilesListCommand, []);

      const out = getStdout();
      expect(out).toContain("default (default)");
      expect(out).toContain("staging");
      expect(out).toContain("https://staging.example.io");
      expect(out).toContain("t-1");
    });

    it("prints a hint when there are no profiles", async () => {
      const result = await runCommand(ProfilesListCommand, []);
      expect(result).toEqual({ items: [] });
      expect(getStderr()).toContain("No profiles found.");
    });
  });

  describe("profiles:use", () => {
    it("repoints the default and keeps the other profiles", async () => {
      await writeProfile("default", makeProfile());
      await writeProfile("staging", makeProfile());

      const result = await runCommand(ProfilesUseCommand, ["staging"]);
      expect(result).toEqual({ profile: "staging" });

      const file = await readConfigFile();
      expect(file?.defaultProfile).toBe("staging");
      expect(Object.keys(file?.profiles ?? {})).toEqual(["default", "staging"]);
      expect(getStderr()).toContain("Using 'staging' by default.");
    });
  });

  describe("profiles:delete", () => {
    it("deletes a profile and reports it", async () => {
      await writeProfile("default", makeProfile());
      await writeProfile("staging", makeProfile());

      const result = await runCommand(ProfilesDeleteCommand, ["staging"]);
      expect(result).toEqual({ profile: "staging", deleted: true, defaultProfile: "default" });

      const file = await readConfigFile();
      expect(Object.keys(file?.profiles ?? {})).toEqual(["default"]);
      expect(getStderr()).toContain("Deleted 'staging'.");
    });

    it("removes the config file when the last profile is deleted", async () => {
      await writeProfile("default", makeProfile());

      const result = await runCommand(ProfilesDeleteCommand, ["default"]);
      expect(result).toEqual({ profile: "default", deleted: true, defaultProfile: null });

      expect(await readConfigFile()).toBeNull();
      expect(getStderr()).toContain("No profiles remain.");
    });

    it("errors when the profile does not exist", async () => {
      await writeProfile("default", makeProfile());
      await expect(runCommand(ProfilesDeleteCommand, ["missing"])).rejects.toThrow(
        /does not exist/,
      );
    });
  });
});

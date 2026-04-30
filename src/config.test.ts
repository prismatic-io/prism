import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type Configuration,
  configFileExists,
  deleteConfig,
  readConfig,
  writeConfig,
} from "./config.js";

const makeConfig = (overrides: Partial<Configuration> = {}): Configuration => ({
  accessToken: "access",
  expiresIn: 3600,
  refreshToken: "refresh",
  scope: "openid profile email",
  tokenType: "Bearer",
  ...overrides,
});

const stubFakeHome = (homeDir: string) => {
  vi.stubEnv("HOME", homeDir);
  vi.stubEnv("USERPROFILE", homeDir);
};

describe("config with PRISM_CONFIG_FILE override", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-config-test-"));
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    configPath = path.join(tmpDir, "config.yml");
    stubFakeHome(tmpDir);
    vi.stubEnv("PRISM_CONFIG_FILE", configPath);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(configPath, { force: true });
  });

  it("writes to the path specified by PRISM_CONFIG_FILE", async () => {
    await writeConfig(makeConfig({ accessToken: "tok-1" }));

    const contents = await readFile(configPath, { encoding: "utf-8" });
    expect(contents).toContain("accessToken: tok-1");
  });

  it("reads from the path specified by PRISM_CONFIG_FILE", async () => {
    await writeConfig(makeConfig({ accessToken: "tok-2" }));

    const result = await readConfig();
    expect(result?.accessToken).toBe("tok-2");
  });

  it("creates the parent directory when it does not exist", async () => {
    const nested = path.join(tmpDir, "nested", "dir", "config.yml");
    vi.stubEnv("PRISM_CONFIG_FILE", nested);

    await writeConfig(makeConfig({ accessToken: "tok-3" }));

    await expect(stat(nested)).resolves.toBeDefined();
    await rm(path.join(tmpDir, "nested"), { recursive: true, force: true });
  });

  it("reports the file as existing only after a write", async () => {
    expect(await configFileExists()).toBe(false);
    await writeConfig(makeConfig());
    expect(await configFileExists()).toBe(true);
  });

  it("deletes the file at the overridden path", async () => {
    await writeConfig(makeConfig());
    expect(await configFileExists()).toBe(true);

    await deleteConfig();
    expect(await configFileExists()).toBe(false);
  });
});

describe("config with PRISM_CONFIG_FILE=/dev/null", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-config-devnull-"));
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    stubFakeHome(tmpDir);
    vi.stubEnv("PRISM_CONFIG_FILE", "/dev/null");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats writes as a no-op so concurrent invocations cannot corrupt the file", async () => {
    const writers = Array.from({ length: 25 }, (_, i) =>
      writeConfig(makeConfig({ accessToken: `tok-${i}` })),
    );
    await expect(Promise.all(writers)).resolves.toBeDefined();
  });

  it("returns null on read since /dev/null is empty", async () => {
    await writeConfig(makeConfig({ accessToken: "ignored" }));
    const result = await readConfig();
    expect(result).toBeNull();
  });
});

describe("config without PRISM_CONFIG_FILE", () => {
  let homeDir: string;

  beforeAll(async () => {
    homeDir = await mkdtemp(path.join(tmpdir(), "prism-config-home-"));
  });

  afterAll(async () => {
    await rm(homeDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    stubFakeHome(homeDir);
    vi.stubEnv("PRISM_CONFIG_FILE", "");
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(path.join(homeDir, ".config"), { recursive: true, force: true });
  });

  it("falls back to the default path under HOME/.config/prism/config.yml", async () => {
    await writeConfig(makeConfig({ accessToken: "default-path" }));

    const expectedPath = path.join(homeDir, ".config", "prism", "config.yml");
    const contents = await readFile(expectedPath, { encoding: "utf-8" });
    expect(contents).toContain("accessToken: default-path");
  });

  it("returns null when the default file does not exist", async () => {
    expect(await readConfig()).toBeNull();
  });

  it("returns null when the file exists but is empty", async () => {
    const expectedPath = path.join(homeDir, ".config", "prism", "config.yml");
    await writeConfig(makeConfig());
    await writeFile(expectedPath, "", { encoding: "utf-8" });

    expect(await readConfig()).toBeNull();
  });
});

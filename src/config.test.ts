import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type Configuration,
  deleteProfile,
  getActiveProfileName,
  listProfiles,
  type Profile,
  readConfigFile,
  readProfile,
  useProfile,
  writeActiveProfile,
  writeProfile,
} from "./config.js";
import { DEFAULT_PRISMATIC_URL } from "./env.js";
import { dumpYaml } from "./utils/serialize.js";

const makeConfig = (overrides: Partial<Configuration> = {}): Configuration => ({
  accessToken: "access",
  expiresIn: 3600,
  refreshToken: "refresh",
  scope: "openid profile email",
  tokenType: "Bearer",
  ...overrides,
});

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  ...makeConfig(),
  prismaticUrl: "https://app.prismatic.io",
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
    await writeActiveProfile(makeConfig({ accessToken: "tok-1" }));

    const contents = await readFile(configPath, { encoding: "utf-8" });
    expect(contents).toContain("accessToken: tok-1");
  });

  it("reads from the path specified by PRISM_CONFIG_FILE", async () => {
    await writeActiveProfile(makeConfig({ accessToken: "tok-2" }));

    const result = await readProfile();
    expect(result?.accessToken).toBe("tok-2");
  });

  it("creates the parent directory when it does not exist", async () => {
    const nested = path.join(tmpDir, "nested", "dir", "config.yml");
    vi.stubEnv("PRISM_CONFIG_FILE", nested);

    await writeActiveProfile(makeConfig({ accessToken: "tok-3" }));

    await expect(stat(nested)).resolves.toBeDefined();
    await rm(path.join(tmpDir, "nested"), { recursive: true, force: true });
  });

  it("deletes the file at the overridden path", async () => {
    await writeActiveProfile(makeConfig());
    await deleteProfile(await getActiveProfileName());
    expect(await readConfigFile()).toBeNull();
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
      writeActiveProfile(makeConfig({ accessToken: `tok-${i}` })),
    );
    await expect(Promise.all(writers)).resolves.toBeDefined();
  });

  it("returns null on read since /dev/null is empty", async () => {
    await writeActiveProfile(makeConfig({ accessToken: "ignored" }));
    const result = await readProfile();
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
    await writeActiveProfile(makeConfig({ accessToken: "default-path" }));

    const expectedPath = path.join(homeDir, ".config", "prism", "config.yml");
    const contents = await readFile(expectedPath, { encoding: "utf-8" });
    expect(contents).toContain("accessToken: default-path");
  });

  it("returns null when the default file does not exist", async () => {
    expect(await readProfile()).toBeNull();
  });

  it("returns null when the file exists but is empty", async () => {
    const expectedPath = path.join(homeDir, ".config", "prism", "config.yml");
    await writeActiveProfile(makeConfig());
    await writeFile(expectedPath, "", { encoding: "utf-8" });

    expect(await readProfile()).toBeNull();
  });
});

describe("config schema validation", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-config-schema-"));
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

  it("refuses to write a configuration missing required fields", async () => {
    const invalid = { accessToken: "tok" } as unknown as Configuration;
    await expect(writeActiveProfile(invalid)).rejects.toThrow(/could not save its configuration/);
  });

  it("refuses to write a configuration with empty required strings", async () => {
    const invalid = makeConfig({ accessToken: "" });
    await expect(writeActiveProfile(invalid)).rejects.toThrow(/accessToken cannot be empty/);
  });

  it("refuses to write a configuration with the wrong field type", async () => {
    const invalid = makeConfig({ expiresIn: "soon" as unknown as number });
    await expect(writeActiveProfile(invalid)).rejects.toThrow(/could not save its configuration/);
  });

  it("rejects a config file missing required fields when reading", async () => {
    await writeFile(configPath, dumpYaml({ accessToken: "tok" }), { encoding: "utf-8" });
    await expect(readProfile()).rejects.toThrow(/could not read the configuration/);
  });

  it("rejects a config file containing the wrong field type when reading", async () => {
    await writeFile(
      configPath,
      dumpYaml({
        accessToken: "tok",
        expiresIn: "not-a-number",
        refreshToken: "r",
        scope: "s",
        tokenType: "Bearer",
      }),
      { encoding: "utf-8" },
    );
    await expect(readProfile()).rejects.toThrow(/could not read the configuration/);
  });

  it("throws a helpful error when the config file is not valid yaml", async () => {
    await writeFile(configPath, "::: not yaml :::\n\t- :", { encoding: "utf-8" });
    await expect(readProfile()).rejects.toThrow(/Failed to parse configuration/);
  });

  it("accepts an optional tenantId when present", async () => {
    await writeActiveProfile(makeConfig({ tenantId: "tenant-1" }));
    const result = await readProfile();
    expect(result?.tenantId).toBe("tenant-1");
  });
});

describe("multi-profile config", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-config-profiles-"));
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

  it("writes a versioned file that points its default at the first profile", async () => {
    await writeProfile("staging", makeProfile({ accessToken: "stg" }));

    const contents = await readFile(configPath, { encoding: "utf-8" });
    expect(contents).toContain("version: 1");
    expect(contents).toContain("defaultProfile: staging");

    const file = await readConfigFile();
    expect(file?.version).toBe(1);
    expect(file?.defaultProfile).toBe("staging");
    expect(file?.profiles.staging?.accessToken).toBe("stg");
  });

  it("merges additional profiles while preserving the default pointer", async () => {
    await writeProfile("default", makeProfile({ accessToken: "def" }));
    await writeProfile("staging", makeProfile({ accessToken: "stg" }));

    const file = await readConfigFile();
    expect(file?.defaultProfile).toBe("default");
    expect(Object.keys(file?.profiles ?? {})).toEqual(["default", "staging"]);
    expect(file?.profiles.default?.accessToken).toBe("def");
    expect(file?.profiles.staging?.accessToken).toBe("stg");
  });

  it("reads the default profile when no name is given, or a named one when asked", async () => {
    await writeProfile("default", makeProfile({ accessToken: "def" }));
    await writeProfile("staging", makeProfile({ accessToken: "stg" }));

    expect((await readProfile())?.accessToken).toBe("def");
    expect((await readProfile("staging"))?.accessToken).toBe("stg");
    expect(await readProfile("missing")).toBeNull();
  });

  it("lists profiles and marks the default", async () => {
    await writeProfile("default", makeProfile({ tenantId: "t-1" }));
    await writeProfile("staging", makeProfile({ prismaticUrl: "https://staging.example.io" }));

    const profiles = await listProfiles();
    expect(profiles).toEqual([
      {
        name: "default",
        prismaticUrl: "https://app.prismatic.io",
        tenantId: "t-1",
        isDefault: true,
      },
      {
        name: "staging",
        prismaticUrl: "https://staging.example.io",
        tenantId: undefined,
        isDefault: false,
      },
    ]);
  });

  it("repoints the default to a remaining profile when the default is deleted", async () => {
    await writeProfile("default", makeProfile());
    await writeProfile("staging", makeProfile());

    await deleteProfile("default");

    const file = await readConfigFile();
    expect(file?.defaultProfile).toBe("staging");
    expect(Object.keys(file?.profiles ?? {})).toEqual(["staging"]);
  });

  it("unlinks the file once the last profile is deleted", async () => {
    await writeProfile("default", makeProfile());

    await deleteProfile("default");

    expect(await readConfigFile()).toBeNull();
  });

  it("rejects a config file declaring an unsupported version", async () => {
    await writeFile(configPath, dumpYaml({ version: 2, defaultProfile: "default", profiles: {} }), {
      encoding: "utf-8",
    });
    await expect(readConfigFile()).rejects.toThrow(/could not read the configuration/);
  });

  it("rejects a default profile pointer that does not exist", async () => {
    await writeFile(
      configPath,
      dumpYaml({
        version: 1,
        defaultProfile: "missing",
        profiles: { default: makeProfile() },
      }),
      { encoding: "utf-8" },
    );

    await expect(readConfigFile()).rejects.toThrow(/default profile does not exist/);
  });

  it("resolves the active profile name from PRISM_PROFILE, then the file default", async () => {
    await writeProfile("default", makeProfile());
    await writeProfile("staging", makeProfile());

    expect(await getActiveProfileName()).toBe("default");

    vi.stubEnv("PRISM_PROFILE", "staging");
    expect(await getActiveProfileName()).toBe("staging");
  });

  it("repoints the default pointer with useProfile without touching profiles", async () => {
    await writeProfile("default", makeProfile({ accessToken: "def" }));
    await writeProfile("staging", makeProfile({ accessToken: "stg" }));

    await useProfile("staging");

    const file = await readConfigFile();
    expect(file?.defaultProfile).toBe("staging");
    expect(Object.keys(file?.profiles ?? {})).toEqual(["default", "staging"]);
    expect(file?.profiles.default?.accessToken).toBe("def");
  });

  it("throws when useProfile targets a profile that does not exist", async () => {
    await writeProfile("default", makeProfile());
    await expect(useProfile("missing")).rejects.toThrow(/Profile "missing" does not exist/);
  });
});

describe("unversioned config support", () => {
  let tmpDir: string;
  let configPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "prism-config-unversioned-"));
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

  const writeUnversionedFile = (overrides: Partial<Configuration> = {}) =>
    writeFile(configPath, dumpYaml(makeConfig(overrides)), { encoding: "utf-8" });

  it("reads an unversioned session as the default profile", async () => {
    await writeUnversionedFile({ accessToken: "session-token", tenantId: "tenant-1" });

    const file = await readConfigFile();
    expect(file?.version).toBe(1);
    expect(file?.defaultProfile).toBe("default");
    expect(file?.profiles.default?.accessToken).toBe("session-token");
    expect(file?.profiles.default?.tenantId).toBe("tenant-1");

    const profile = await readProfile();
    expect(profile?.accessToken).toBe("session-token");
  });

  it("resolves the unversioned session URL from the environment or default", async () => {
    await writeUnversionedFile();

    vi.stubEnv("PRISMATIC_URL", "");
    const fromDefault = await readProfile();
    expect(fromDefault?.prismaticUrl).toBe(DEFAULT_PRISMATIC_URL);

    vi.stubEnv("PRISMATIC_URL", "https://staging.example.io");
    const fromEnv = await readProfile();
    expect(fromEnv?.prismaticUrl).toBe("https://staging.example.io");
  });

  it("does not change the file during a read", async () => {
    await writeUnversionedFile({ accessToken: "session-token" });
    const contents = await readFile(configPath, { encoding: "utf-8" });

    await readConfigFile();

    expect(await readFile(configPath, { encoding: "utf-8" })).toBe(contents);
  });

  it("persists the multi-profile shape on the next write", async () => {
    await writeUnversionedFile({ accessToken: "session-token" });

    await writeActiveProfile(makeConfig({ accessToken: "fresh-token" }));

    const contents = await readFile(configPath, { encoding: "utf-8" });
    expect(contents).toContain("version: 1");
    expect(contents).toContain("defaultProfile: default");
    expect(contents).toContain("accessToken: fresh-token");
  });
});

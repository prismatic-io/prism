import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { devNull, tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getProfile, type Profile } from "./config.js";
import { ConfigStore } from "./config-store.js";
import { fs } from "./fs.js";

const profile: Profile = {
  accessToken: "access",
  refreshToken: "refresh",
  expiresIn: 3600,
  scope: "openid",
  tokenType: "Bearer",
  prismaticUrl: "https://app.example",
};
const options = { legacyUrl: "https://legacy.example" };

describe("ConfigStore", () => {
  let directory: string;
  let filePath: string;
  let store: ConfigStore;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "prism-config-store-"));
    filePath = path.join(directory, "config.yml");
    store = new ConfigStore(filePath, options);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it("starts empty and preserves the first default when adding profiles", async () => {
    expect(await store.read()).toBeNull();
    await store.saveProfile("first", profile);
    await store.saveProfile("second", { ...profile, tenantId: "tenant" });
    expect(await new ConfigStore(filePath, options).read()).toEqual({
      defaultProfile: "first",
      profiles: { first: profile, second: { ...profile, tenantId: "tenant" } },
    });
  });

  it("lists profile metadata without returning credentials", async () => {
    await store.saveProfile("first", profile);
    await store.saveProfile("second", { ...profile, tenantId: "tenant" });
    expect(await store.listProfiles()).toEqual([
      { name: "first", prismaticUrl: profile.prismaticUrl, tenantId: undefined, isDefault: true },
      { name: "second", prismaticUrl: profile.prismaticUrl, tenantId: "tenant", isDefault: false },
    ]);
  });

  it("sets the default without changing credentials and does not rewrite a no-op", async () => {
    await store.saveProfile("first", profile);
    await store.saveProfile("second", profile);
    await store.setDefaultProfile("second");
    expect(await store.read()).toEqual({
      defaultProfile: "second",
      profiles: { first: profile, second: profile },
    });
    const rename = vi.spyOn(fs, "rename");
    await store.setDefaultProfile("second");
    expect(rename).not.toHaveBeenCalled();
    await expect(store.setDefaultProfile("missing")).rejects.toThrow(
      'Profile "missing" does not exist.',
    );
  });

  it("removes profiles, reassigns the default, and deletes the final file", async () => {
    await store.saveProfile("first", profile);
    await store.saveProfile("second", profile);
    expect(await store.deleteProfile("missing")).toEqual({ deleted: false });
    expect(await store.deleteProfile("first")).toEqual({
      deleted: true,
      isLast: false,
      defaultChanged: true,
      defaultProfile: "second",
    });
    expect(getProfile(await store.read(), "first")).toBeNull();
    expect(await store.deleteProfile("second")).toEqual({ deleted: true, isLast: true });
    expect(await store.read()).toBeNull();
    await expect(stat(filePath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("preserves the saved default when deleting another profile", async () => {
    await store.saveProfile("first", profile);
    await store.saveProfile("second", profile);
    expect(await store.deleteProfile("second")).toEqual({
      deleted: true,
      isLast: false,
      defaultChanged: false,
      defaultProfile: "first",
    });
  });

  it("retains concurrent updates from separate store instances", async () => {
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        new ConfigStore(filePath, options).saveProfile(`profile-${i}`, {
          ...profile,
          accessToken: `token-${i}`,
        }),
      ),
    );
    const saved = await store.read();
    expect(Object.keys(saved?.profiles ?? {})).toHaveLength(12);
    for (let i = 0; i < 12; i++)
      expect(getProfile(saved, `profile-${i}`)?.accessToken).toBe(`token-${i}`);
  });

  it("keeps readers on complete previous state while another file can update", async () => {
    await store.saveProfile("first", profile);
    const entered = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const rename = fs.rename.bind(fs);
    vi.spyOn(fs, "rename").mockImplementation(async (source, destination) => {
      if (String(destination) === (await fs.realpath(filePath))) {
        entered.resolve();
        await release.promise;
      }
      await rename(source, destination);
    });
    const pending = store.saveProfile("second", profile);
    try {
      await entered.promise;
      expect(Object.keys((await store.read())?.profiles ?? {})).toEqual(["first"]);
      const other = new ConfigStore(path.join(directory, "other.yml"), options);
      await other.saveProfile("independent", profile);
      expect((await other.read())?.defaultProfile).toBe("independent");
    } finally {
      release.resolve();
      await pending;
    }
    expect(Object.keys((await store.read())?.profiles ?? {})).toEqual(["first", "second"]);
  });

  it("shares coordination through directory aliases before first creation", async () => {
    const alias = path.join(directory, "alias");
    await fs.symlink(directory, alias, "junction");
    try {
      const stores = [store, new ConfigStore(path.join(alias, "config.yml"), options)];
      await Promise.all(
        Array.from({ length: 12 }, (_, i) => stores[i % 2].saveProfile(`profile-${i}`, profile)),
      );
      expect(Object.keys((await store.read())?.profiles ?? {})).toHaveLength(12);
    } finally {
      await fs.unlink(alias);
    }
  });

  it.skipIf(process.platform === "win32")(
    "retains a dangling file alias through deletion and recreation",
    async () => {
      const alias = path.join(directory, "alias.yml");
      await fs.symlink("config.yml", alias);
      await new ConfigStore(alias, options).saveProfile("first", profile);
      await new ConfigStore(alias, options).deleteProfile("first");
      await new ConfigStore(alias, options).saveProfile("second", profile);
      expect((await fs.lstat(alias)).isSymbolicLink()).toBe(true);
      expect((await store.read())?.defaultProfile).toBe("second");
    },
  );

  it.skipIf(process.platform === "win32")("rejects symlink cycles", async () => {
    const alias = path.join(directory, "alias.yml");
    await fs.symlink("alias.yml", filePath);
    await fs.symlink("config.yml", alias);
    await expect(store.read()).rejects.toMatchObject({ code: "ELOOP" });
  });

  it("releases the queue after validation fails without replacing existing state", async () => {
    await store.saveProfile("original", profile);
    const results = await Promise.allSettled([
      store.saveProfile("invalid", { ...profile, accessToken: "" }),
      new ConfigStore(filePath, options).saveProfile("valid", profile),
    ]);
    expect(results.map(({ status }) => status)).toEqual(["rejected", "fulfilled"]);
    expect(Object.keys((await store.read())?.profiles ?? {})).toEqual(["original", "valid"]);
  });

  it("preserves previous bytes and cleans temporary files after failed replacement", async () => {
    await store.saveProfile("original", profile);
    const original = await readFile(filePath, "utf8");
    const rename = vi.spyOn(fs, "rename").mockRejectedValueOnce(new Error("rename failed"));
    await expect(store.saveProfile("failed", profile)).rejects.toThrow("rename failed");
    expect(await readFile(filePath, "utf8")).toBe(original);
    expect((await fs.readdir(directory)).filter((name) => name.endsWith(".tmp"))).toEqual([]);
    rename.mockRestore();
    await store.saveProfile("recovered", profile);
    expect(getProfile(await store.read(), "recovered")).toEqual(profile);
  });

  it("does not hide a write failure when cleanup also fails", async () => {
    vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error("disk full"));
    vi.spyOn(fs, "rm").mockRejectedValueOnce(new Error("cleanup failed"));
    await expect(store.saveProfile("first", profile)).rejects.toThrow("disk full");
  });

  it("creates private files in missing directories", async () => {
    const nestedPath = path.join(directory, "nested", "config.yml");
    const nested = new ConfigStore(nestedPath, options);
    await nested.saveProfile("first", profile);
    expect(getProfile(await nested.read(), "first")).toEqual(profile);
    if (process.platform !== "win32") expect((await stat(nestedPath)).mode & 0o777).toBe(0o600);
  });

  it("keeps explicit storage and legacy context independent of ambient environment", async () => {
    vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "other.yml"));
    vi.stubEnv("PRISMATIC_URL", "https://other.example");
    await store.saveProfile("first", profile);
    expect(getProfile(await store.read(), "first")).toEqual(profile);
    expect(await new ConfigStore(path.join(directory, "other.yml"), options).read()).toBeNull();
  });

  it("treats empty files and the null device as no saved profiles", async () => {
    await writeFile(filePath, "");
    expect(await store.read()).toBeNull();
    const sink = new ConfigStore(devNull, options);
    await Promise.all(Array.from({ length: 12 }, () => sink.saveProfile("ignored", profile)));
    expect(await sink.read()).toBeNull();
    expect(await sink.deleteProfile("ignored")).toEqual({ deleted: false });
  });

  it.each([
    "toString",
    "constructor",
    "__proto__",
  ])("handles profile name %s as an own property", async (name) => {
    await store.saveProfile("first", profile);
    expect(getProfile(await store.read(), name)).toBeNull();
    await expect(store.setDefaultProfile(name)).rejects.toThrow("does not exist");
    expect(await store.deleteProfile(name)).toEqual({ deleted: false });
    await store.saveProfile(name, profile);
    expect(getProfile(await store.read(), name)).toEqual(profile);
    await store.setDefaultProfile(name);
    expect((await store.read())?.defaultProfile).toBe(name);
  });

  it("compares optional tenant values rather than their property presence", async () => {
    await store.saveProfile("first", profile);
    const expected = { ...profile, tenantId: undefined };
    const { prismaticUrl: _url, ...credentials } = expected;
    expect(
      await store.replaceCredentials("first", expected, { ...credentials, accessToken: "fresh" }),
    ).toBe(true);
    expect(getProfile(await store.read(), "first")?.accessToken).toBe("fresh");
  });

  it("conditionally replaces credentials while retaining the endpoint", async () => {
    await store.saveProfile("first", profile);
    const { prismaticUrl: _url, ...credentials } = profile;
    expect(
      await store.replaceCredentials("first", profile, { ...credentials, accessToken: "fresh" }),
    ).toBe(true);
    expect(getProfile(await store.read(), "first")).toEqual({ ...profile, accessToken: "fresh" });
    expect(await store.replaceCredentials("first", profile, credentials)).toBe(false);
    await store.deleteProfile("first");
    expect(
      await store.replaceCredentials("first", { ...profile, accessToken: "fresh" }, credentials),
    ).toBe(false);
    expect(await store.read()).toBeNull();
  });
});

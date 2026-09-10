import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Credentials, getProfile } from "./config.js";
import { ConfigStore } from "./config-store.js";
import { dumpYaml } from "./utils/serialize.js";

const credentials: Credentials = {
  accessToken: "access",
  refreshToken: "refresh",
  expiresIn: 3600,
  scope: "openid",
  tokenType: "Bearer",
};

describe("configuration format persistence", () => {
  let directory: string;
  let filePath: string;
  let store: ConfigStore;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "prism-config-format-"));
    filePath = path.join(directory, "config.yml");
    store = new ConfigStore(filePath, { legacyUrl: "https://legacy.example" });
  });
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("interprets legacy credentials without rewriting the file, including no-op updates", async () => {
    const original = dumpYaml(credentials);
    await writeFile(filePath, original);
    expect(getProfile(await store.read(), "default")).toEqual({
      ...credentials,
      prismaticUrl: "https://legacy.example",
    });
    await store.setDefaultProfile("default");
    await store.deleteProfile("missing");
    expect(await readFile(filePath, "utf8")).toBe(original);
  });

  it("writes the current format only on a real mutation and retains the inferred legacy URL", async () => {
    await writeFile(filePath, dumpYaml(credentials));
    await store.saveProfile("new", { ...credentials, prismaticUrl: "https://new.example" });
    expect(await readFile(filePath, "utf8")).toContain("version: 1");
    const reopened = new ConfigStore(filePath, { legacyUrl: "https://different.example" });
    expect(getProfile(await reopened.read(), "default")?.prismaticUrl).toBe(
      "https://legacy.example",
    );
    expect((await reopened.read())?.defaultProfile).toBe("default");
  });

  it("does not replace an unsupported format on mutation", async () => {
    const original = "version: 99\n";
    await writeFile(filePath, original);
    await expect(
      store.saveProfile("new", { ...credentials, prismaticUrl: "https://new.example" }),
    ).rejects.toThrow();
    expect(await readFile(filePath, "utf8")).toBe(original);
  });
});

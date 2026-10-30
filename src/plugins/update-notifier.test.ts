import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStderr, getStdout } from "../../vitest.setup.js";
import { isNewerVersion, notifyUpdate, updateNotifier } from "./update-notifier.js";

const fetch = vi.fn();

let directory: string;
let environment: NodeJS.ProcessEnv;
let file: string;
beforeEach(async () => {
  fetch.mockReset().mockResolvedValue(Response.json({ version: "1.0.0" }));
  vi.stubGlobal("fetch", fetch);
  directory = await mkdtemp(join(tmpdir(), "prism-notifier-"));
  environment = { XDG_CACHE_HOME: directory };
  file = join(directory, "prism", "update.json");
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});
const seed = async (checkedAt = Date.now(), latest = "999.0.0") => {
  await mkdir(join(directory, "prism"), { recursive: true });
  await writeFile(file, JSON.stringify({ checkedAt, latest }));
};

describe("update notifier", () => {
  it("writes cached notices only to stderr and skips a fresh check", async () => {
    await seed();
    await notifyUpdate(environment);
    expect(getStdout()).toBe("");
    expect(getStderr()).toContain("→ 999.0.0");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refreshes a stale cache once and prints the new version immediately", async () => {
    await seed(0, "1.0.0");
    fetch.mockResolvedValue(Response.json({ version: "999.0.0" }));
    await notifyUpdate(environment);
    expect(fetch).toHaveBeenCalledWith(
      "https://registry.npmjs.org/@prismatic-io%2fprism/latest",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(JSON.parse(await readFile(file, "utf8"))).toEqual({
      checkedAt: expect.any(Number),
      latest: "999.0.0",
    });
    expect(getStdout()).toBe("");
    expect(getStderr()).toContain("→ 999.0.0");
    await notifyUpdate(environment);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { NO_UPDATE_NOTIFIER: "1" },
    { npm_config_update_notifier: "false" },
  ])("respects opt-out %j", async (override) => {
    await seed(0);
    await notifyUpdate({ ...environment, ...override });
    expect(getStdout()).toBe("");
    expect(getStderr()).toBe("");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("silently tolerates an unwritable cache", async () => {
    await writeFile(join(directory, "prism"), "not a directory");
    await expect(notifyUpdate(environment)).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
    expect(getStderr()).toBe("");
  });

  it("recovers from a malformed cache", async () => {
    await seed();
    await writeFile(file, "invalid json");
    await notifyUpdate(environment);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getStderr()).toBe("");
  });

  it("checks on the first invocation and caches the result", async () => {
    await notifyUpdate(environment);
    expect(JSON.parse(await readFile(file, "utf8")).latest).toBe("1.0.0");
    await notifyUpdate(environment);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getStdout()).toBe("");
    expect(getStderr()).toBe("");
  });

  it.each(["network", "http", "invalid"])("silently ignores %s failures", async (failure) => {
    await seed(0, "1.0.0");
    if (failure === "network") fetch.mockRejectedValue(new Error("offline"));
    else if (failure === "http")
      fetch.mockResolvedValue(new Response("unavailable", { status: 503 }));
    else fetch.mockResolvedValue(Response.json({ version: "malicious\nnotice" }));
    await notifyUpdate(environment);
    await notifyUpdate(environment);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(await readFile(file, "utf8")).latest).toBe("1.0.0");
    expect(getStderr()).toBe("");
  });
});

it.each([
  ["12.0.0", "11.9.9", true],
  ["11.10.0", "11.9.0", true],
  ["11.1.2", "11.1.1", true],
  ["11.1.1", "11.1.1", false],
  ["10.9.9", "11.1.1", false],
  ["12.0.0-beta.1", "11.1.1", false],
  ["12.0.0", "12.0.0-beta.1", true],
  ["not a version", "11.1.1", false],
])("compares %s against %s", (latest, current, expected) => {
  expect(isNewerVersion(latest, current)).toBe(expected);
});

const complete = (override: Partial<Parameters<typeof updateNotifier.afterCommand>[0]> = {}) =>
  updateNotifier.afterCommand({
    agent: false,
    exitCode: 0,
    environment,
    ...override,
  });

it("notifies after a successful human command", async () => {
  await seed();
  await complete();
  expect(getStdout()).toBe("");
  expect(getStderr()).toContain("→ 999.0.0");
});

it.for([{ agent: true }, { exitCode: 1 }])("skips notifications for %j", async (override) => {
  await seed(0);
  await complete(override);
  expect(getStderr()).toBe("");
  expect(fetch).not.toHaveBeenCalled();
});

it("does not infer suppression from CI", async () => {
  await seed();
  await complete({ environment: { ...environment, CI: "true" } });
  expect(getStderr()).toContain("→ 999.0.0");
});

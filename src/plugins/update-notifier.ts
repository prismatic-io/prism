import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import packageJson from "../../package.json" with { type: "json" };
import { fetch } from "../utils/http.js";

const interval = 24 * 60 * 60 * 1000;
const cachePath = (environment: NodeJS.ProcessEnv) =>
  join(environment.XDG_CACHE_HOME || join(homedir(), ".cache"), "prism", "update.json");
type Cache = { checkedAt: number; latest?: string };

const stableVersion = (value: string) => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  return match?.slice(1).map(Number);
};

export const isNewerVersion = (latest: string, current: string): boolean => {
  const next = stableVersion(latest);
  const installed = stableVersion(current.split("-", 1)[0]);
  if (!next || !installed) return false;
  for (let index = 0; index < 3; index += 1) {
    if (next[index] !== installed[index]) return next[index] > installed[index];
  }
  return current.includes("-");
};

const readCache = async (environment: NodeJS.ProcessEnv): Promise<Cache | undefined> => {
  try {
    const cache = JSON.parse(await readFile(cachePath(environment), "utf8"));
    if (
      typeof cache.checkedAt === "number" &&
      Number.isFinite(cache.checkedAt) &&
      (cache.latest === undefined ||
        (typeof cache.latest === "string" && stableVersion(cache.latest)))
    )
      return cache;
  } catch {}
  return undefined;
};

const saveCache = async (cache: Cache, environment: NodeJS.ProcessEnv) => {
  const file = cachePath(environment);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(cache));
};

const fetchLatestVersion = async (): Promise<string | undefined> => {
  try {
    const response = await fetch("https://registry.npmjs.org/@prismatic-io%2fprism/latest", {
      signal: AbortSignal.timeout(1000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return undefined;
    const data = (await response.json()) as { version?: unknown };
    return typeof data.version === "string" && stableVersion(data.version)
      ? data.version
      : undefined;
  } catch {
    return undefined;
  }
};

export const notifyUpdate = async (environment = process.env): Promise<void> => {
  if (environment.NO_UPDATE_NOTIFIER || environment.npm_config_update_notifier === "false") return;
  try {
    let cache = await readCache(environment);
    if (!cache || Date.now() - cache.checkedAt >= interval) {
      // Cache failed attempts too, so offline commands do not retry all day.
      cache = { checkedAt: Date.now(), latest: cache?.latest };
      await saveCache(cache, environment);
      const latest = await fetchLatestVersion();
      if (latest) {
        cache.latest = latest;
        await saveCache(cache, environment);
      }
    }
    if (cache?.latest && isNewerVersion(cache.latest, packageJson.version)) {
      process.stderr.write(
        `\nUpdate available for ${packageJson.name}: ${packageJson.version} → ${cache.latest}\nRun npm install -g ${packageJson.name} to update.\n`,
      );
    }
  } catch {
    // Read-only caches and failed update checks must not break the CLI.
  }
};

type CommandCompletion = {
  agent: boolean;
  exitCode: typeof process.exitCode;
  environment: NodeJS.ProcessEnv;
};

const afterCommand = async ({ agent, exitCode, environment }: CommandCompletion): Promise<void> => {
  if (agent || exitCode) return;
  await notifyUpdate(environment);
};

// Notify after CLI execution, when its final exit status is available.
export const updateNotifier = {
  cliOptions: { update: false as const },
  afterCommand,
};

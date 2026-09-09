import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const entrypoint = fileURLToPath(new URL("../../lib/run.js", import.meta.url));
const run = (...args: string[]) =>
  spawnSync(process.execPath, [entrypoint, ...args], {
    encoding: "utf8",
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_HUMAN_MODE: "true" },
  });

beforeAll(async () => {
  await access(entrypoint);
});

describe("built CLI", () => {
  it("prints its version", () => {
    const result = run("--version");
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/\b\d+\.\d+\.\d+\b/);
  });

  it("renders public help without internal compatibility names", () => {
    const result = run("--help");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/Usage: prism <command>/);
    expect(result.stdout).not.toMatch(/__self|legacyNo|legacy-no/);
  });

  it("exposes a list output schema through a legacy colon route", () => {
    const result = run("customers:list", "--schema");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/items/);
    expect(result.stdout).toMatch(/pageInfo/);
  });

  it("rejects unexpected positional arguments", () => {
    const result = run("--agent", "profiles:list", "unexpected");
    expect(result.status, result.stderr || result.stdout).toBe(2);
    expect(result.stdout).toMatch(/code: VALIDATION_ERROR/);
  });

  it("requires approval before a mutation", () => {
    const result = run("--agent", "profiles:delete", "default");
    expect(result.status, result.stderr || result.stdout).toBe(2);
    expect(result.stdout).toMatch(/code: CONFIRMATION_REQUIRED/);
  });
});

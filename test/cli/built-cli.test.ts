import { execFile, spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
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

  it("explains local filtering and complete pagination in list help", () => {
    const result = run("instances", "list", "--help");
    expect(result.status, result.stderr).toBe(0);
    const help = result.stdout.replace(/\s+/g, " ");
    expect(help).toContain("Filter fetched rows locally by case-sensitive regex");
    expect(help).toContain("matches anywhere");
    expect(help).toContain("Fetch every page before applying local table filters");
  });

  it("exposes local integration validation through discovery", () => {
    const result = run("integrations", "validate", "--schema");
    expect(result.status, result.stderr).toBe(0);
    for (const field of ["entrypoint", "componentKey", "flowCount", "valid"])
      expect(result.stdout).toContain(field);
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

it("redacts native manifest-generator failure diagnostics in agent and human mode", async () => {
  const directory = await mkdtemp(join(tmpdir(), "prism-native-diagnostic-"));
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.synthetic_signature";
  const server = createServer((request, response) => {
    request.resume();
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        data: {
          components: {
            nodes: [
              {
                id: "synthetic",
                key: "slack",
                public: true,
                versionNumber: 1,
              },
            ],
          },
        },
      }),
    );
  });
  try {
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing fixture port");
    const spectral = join(directory, "node_modules/@prismatic-io/spectral");
    await mkdir(spectral, { recursive: true });
    await writeFile(join(directory, "package.json"), "{}");
    await writeFile(
      join(spectral, "package.json"),
      JSON.stringify({
        name: "@prismatic-io/spectral",
        version: "10.30.3",
        bin: { "cni-component-manifest": "generator.cjs" },
      }),
    );
    await writeFile(
      join(spectral, "generator.cjs"),
      "console.error({config:{headers:{Authorization:'Bearer '+process.env.PRISM_ACCESS_TOKEN}},path:'/api'});process.exit(17)",
    );
    for (const mode of ["--agent", "--no-agent"]) {
      const result = await promisify(execFile)(
        process.execPath,
        [entrypoint, "integrations", "manifests", "add", "slack", mode, "--yes"],
        {
          cwd: directory,
          timeout: 15_000,
          env: {
            ...process.env,
            PRISM_READ_ONLY: "false",
            PRISM_ACCESS_TOKEN: token,
            PRISM_REFRESH_TOKEN: "",
            PRISMATIC_URL: `http://127.0.0.1:${address.port}`,
            PRISM_CONFIG_FILE: join(directory, "missing.yml"),
            NO_PROXY: "127.0.0.1",
          },
        },
      ).then(
        () => {
          throw new Error("Expected generator failure");
        },
        (error: { code: number; stdout: string; stderr: string }) => error,
      );
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain("exit code 17");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain(token);
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
});

it.each([
  "flag",
  "environment",
])("rejects native local scaffolding before any writes with %s policy", async (policy) => {
  const directory = await mkdtemp(join(tmpdir(), "prism-native-readonly-"));
  try {
    for (const route of [["components", "init"], ["components:init"], ["integrations", "init"]]) {
      const name = "must-not-exist";
      const result = spawnSync(
        process.execPath,
        [
          entrypoint,
          ...route,
          name,
          "--agent",
          "--yes",
          "--json",
          ...(policy === "flag" ? ["--read-only"] : []),
        ],
        {
          cwd: directory,
          encoding: "utf8",
          timeout: 30_000,
          env: { ...process.env, PRISM_READ_ONLY: policy === "environment" ? "true" : "false" },
        },
      );
      expect(result.status, result.stdout + result.stderr).toBe(2);
      expect(JSON.parse(result.stdout)).toMatchObject({ code: "READ_ONLY" });
      expect(await readdir(directory)).toEqual([]);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it.each([
  { route: ["components", "init"] },
  { route: ["components:init"] },
])("routes %j positional names to the default initializer", async ({ route }) => {
  const directory = await mkdtemp(join(tmpdir(), "prism-native-scaffold-"));
  try {
    for (const policy of ["flag", "environment"]) {
      const name = `local-${policy}`;
      const result = spawnSync(
        process.execPath,
        [entrypoint, ...route, name, "--agent", "--yes", "--json"],
        {
          cwd: directory,
          encoding: "utf8",
          timeout: 30_000,
          env: { ...process.env, PRISM_READ_ONLY: "false" },
        },
      );
      expect(result.status, result.stdout + result.stderr).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output).toMatchObject({ name, toolchain: "modern" });
      // Windows cwd can use an 8.3 alias; compare the actual directory identities.
      expect(await realpath(output.path)).toBe(await realpath(join(directory, name)));
      await access(join(directory, name, "package.json"));
    }
    const explicit = spawnSync(
      process.execPath,
      [
        entrypoint,
        "components",
        "init",
        "component",
        "--name",
        "explicit",
        "--description",
        "Explicit fixture",
        "--agent",
        "--yes",
        "--json",
      ],
      {
        cwd: directory,
        encoding: "utf8",
        timeout: 30_000,
      },
    );
    expect(explicit.status, explicit.stdout + explicit.stderr).toBe(0);
    expect(JSON.parse(explicit.stdout)).toMatchObject({ name: "explicit" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it.each([
  "EPERM",
  "EACCES",
  "ENOSPC",
])("fails native scaffolding when a generated file cannot be written (%s)", async (code) => {
  const directory = await mkdtemp(join(tmpdir(), "prism-editor-denial-"));
  try {
    const preload = join(directory, "deny.cjs");
    await writeFile(
      preload,
      `const fs = require("node:fs");
const original = fs.writeFile;
fs.writeFile = function(path, ...args) {
  if (String(path).includes(process.env.DENY_SCAFFOLD_PATH)) {
    const callback = args.at(-1);
    return process.nextTick(callback, Object.assign(new Error("synthetic permission denial"), {code: "${code}"}));
  }
  return original.call(this, path, ...args);
};`,
    );
    for (const denied of [".vscode", "package.json"]) {
      const name = denied === ".vscode" ? "editor-denied" : "package-denied";
      const result = spawnSync(
        process.execPath,
        ["--require", preload, entrypoint, "components", "init", name, "--yes"],
        {
          cwd: directory,
          encoding: "utf8",
          timeout: 30_000,
          env: { ...process.env, FORCE_HUMAN_MODE: "true", DENY_SCAFFOLD_PATH: denied },
        },
      );
      expect(result.error).toBeUndefined();
      expect(result.status).not.toBe(0);
      expect(result.stderr + result.stdout).toContain("synthetic permission denial");
      expect(result.stderr + result.stdout).toContain(code);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const runCli = (
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ status: number | null; stderr: string; stdout: string }> =>
  new Promise((resolve, reject) => {
    const child = spawn("bun", ["src/run.ts", ...argv], {
      cwd: projectRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.once("error", reject);
    child.once("close", (status) => resolve({ status, stderr, stdout }));
  });

describe("CLI error output", () => {
  it("prints command errors before exiting non-zero", async () => {
    const result = await runCli(["not-a-command", "--no-agent"]);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("prism --help");
    expect(result.stderr.trim()).toMatch(/not-a-command.*not a command/i);
  }, 15_000);

  it("keeps runtime errors structured in agent mode", async () => {
    const result = await runCli(["--agent", "--yes", "profiles:use", "definitely-missing"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("code: NOT_FOUND");
    expect(result.stdout).toContain("definitely-missing");
    expect(result.stdout).not.toMatch(/^Error:/);
  });

  it.each([
    [["--agent", "not-a-command"], "COMMAND_NOT_FOUND"],
    [["--agent", "profiles:list", "--bogus"], "UNKNOWN_FLAG"],
    [["--agent", "profiles:use"], "VALIDATION_ERROR"],
    [["--agent", "profiles:list", "extra"], "VALIDATION_ERROR"],
  ] as const)("returns usage status 2 and structured output for %j", async (argv, code) => {
    const result = await runCli([...argv], { HOME: "/tmp", PATH: process.env.PATH });
    expect(result.status).toBe(2);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain(`code: ${code}`);
  });

  it("requires explicit approval for agent mutations", async () => {
    const result = await runCli(["--agent", "profiles:delete", "default"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("code: CONFIRMATION_REQUIRED");
  });

  it("enforces read-only mode even with approval", async () => {
    const result = await runCli(["--agent", "--yes", "--read-only", "profiles:delete", "default"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("code: READ_ONLY");
  });

  it("supports process-wide read-only mode for MCP and automation", async () => {
    const result = await runCli(["--agent", "--yes", "profiles:delete", "default"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
      PRISM_READ_ONLY: "true",
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("code: READ_ONLY");
  });

  it("does not expose compatibility implementation names", async () => {
    const result = await runCli(["--llms"]);
    expect(result.status).toBe(0);
    expect(result.stdout).not.toMatch(/__self|legacyNo|legacy-no/);
  });
});

describe("Incur human help", () => {
  it.each([
    ["customers"],
    ["help", "customers"],
  ])("renders a topic separately from its leaf commands: %s", async (...argv) => {
    const result = await runCli([...argv, "--no-agent"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage: prism customers <command>");
    expect(result.stdout).toContain("users   Manage Customer Users");
    expect(result.stdout).toContain("create  Create a new Customer");
    expect(result.stdout).toContain("Custom Global Options");
  });
});

describe("parser compatibility regressions", () => {
  it.each([
    "graphql:query",
    "instances:create",
  ])("does not intercept %s's -v option as CLI version", async (command) => {
    const result = await runCli([command, "-v", "{}", "--no-agent"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.stdout).not.toContain("@prismatic-io/prism/");
    expect(result.status).not.toBe(0);
  });

  it.each([
    [[]],
    [["--json"]],
    [["--format", "yaml"]],
  ])("returns usage errors consistently with format %j", async (format) => {
    const result = await runCli(["--agent", ...format, "customers:list", "--bogus"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(2);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("UNKNOWN_FLAG");
  });

  it.each([
    "integrations:available",
    "integrations:marketplace",
  ])("guards legacy mutations in %s", async (command) => {
    const result = await runCli(["--agent", "--yes", "--read-only", command, "id", "--available"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("READ_ONLY");
  });
});

it.each([
  ["integrations:export", "abc", "--version"],
  ["customers:create", "--name"],
])("rejects missing option values with usage status 2: %j", async (...argv) => {
  const result = await runCli(["--no-agent", ...argv], { HOME: "/tmp", PATH: process.env.PATH });
  expect(result.status).toBe(2);
  expect(result.stdout).not.toContain("11.0.0");
});

describe("native incur entrypoints", () => {
  const completionEnv = (index: number) => ({
    HOME: "/tmp",
    PATH: process.env.PATH,
    COMPLETE: "bash",
    _COMPLETE_INDEX: String(index),
  });

  it("preserves the shell completion protocol words", async () => {
    const result = await runCli(["--", "prism", "cust"], completionEnv(1));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("customers");
    expect(result.stderr).toBe("");
  });

  it("completes legacy colon command names", async () => {
    const result = await runCli(["--", "prism", "customers:l"], completionEnv(1));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("customers:list");
  });

  it.each([
    "customers:create",
    "customers create",
  ])("completes local flags for %s", async (route) => {
    const parts = route.split(" ");
    const result = await runCli(["--", "prism", ...parts, "--na"], completionEnv(parts.length + 1));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--name");
  });

  it("registers native completion hooks in agent mode", async () => {
    const result = await runCli(["--agent", "completions", "bash"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("_incur_complete_prism");
    expect(result.stdout).toContain("_COMPLETE_INDEX");
    expect(result.stdout).not.toContain("COMMAND_NOT_FOUND");
  });

  it.each(["skills", "skill", "mcp"])("delegates native %s routes in agent mode", async (route) => {
    // Group help performs no registration or installation writes.
    const result = await runCli(["--agent", route], { HOME: "/tmp", PATH: process.env.PATH });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).not.toContain("COMMAND_NOT_FOUND");
  });
});

describe("native installation safety", () => {
  it.each(["mcp", "skills", "skill"])("guards %s add before any installation", async (route) => {
    const env = { HOME: "/tmp", PATH: process.env.PATH };
    const unapproved = await runCli(["--agent", route, "add"], env);
    expect(unapproved.status).toBe(2);
    expect(unapproved.stdout).toContain("CONFIRMATION_REQUIRED");
    const readOnly = await runCli(["--agent", "--yes", route, "--read-only", "add"], env);
    expect(readOnly.status).toBe(2);
    expect(readOnly.stdout).toContain("READ_ONLY");
    const envReadOnly = await runCli(["--agent", "--yes", route, "add"], {
      ...env,
      PRISM_READ_ONLY: "true",
    });
    expect(envReadOnly.status).toBe(2);
    expect(envReadOnly.stdout).toContain("READ_ONLY");
  });

  it("does not treat a native command option value as approval", async () => {
    const result = await runCli(["--agent", "mcp", "add", "--command", "--yes"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("CONFIRMATION_REQUIRED");
  });

  it.each(["mcp", "skills", "skill"])("permits %s add help in read-only mode", async (route) => {
    const result = await runCli(["--agent", "--read-only", route, "add", "--help"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
  });
});

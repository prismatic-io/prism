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
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).toMatch(/command .* not found/i);
  }, 15_000);

  it("keeps runtime errors structured in agent mode", async () => {
    const result = await runCli(["--agent", "profiles:use", "definitely-missing"], {
      HOME: "/tmp",
      PATH: process.env.PATH,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("code: UNKNOWN");
    expect(result.stdout).toContain("definitely-missing");
    expect(result.stdout).not.toMatch(/^Error:/);
  });
});

describe("legacy human help", () => {
  it.each([
    ["customers"],
    ["help", "customers"],
  ])("renders a topic separately from its leaf commands: %s", async (...argv) => {
    const result = await runCli([...argv, "--no-agent"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("USAGE\n  $ prism customers:COMMAND");
    expect(result.stdout).toContain("TOPICS\n  customers:users");
    expect(result.stdout).toContain("COMMANDS\n  customers:create");
    expect(result.stdout).not.toContain("Custom Global Options");
  });
});

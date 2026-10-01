import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withWorkingDirectory } from "./command-context.js";
import { Commands } from "./index.js";
import { runCommand } from "./test-command.js";

describe("read-only project creation", () => {
  it.each([
    "flag",
    "environment",
  ])("blocks project creation before writing files with %s read-only policy", async (policy) => {
    const root = await mkdtemp(join(tmpdir(), "prism-read-only-"));
    if (policy === "environment") vi.stubEnv("PRISM_READ_ONLY", "true");
    const approval = ["--agent", "--yes", ...(policy === "flag" ? ["--read-only"] : [])];
    try {
      for (const [command, name] of [
        ["integrations:init", "order-bridge"],
        ["components:init", "private-service"],
      ] as const) {
        await expect(
          withWorkingDirectory(root, () => runCommand(Commands[command], [name, ...approval])),
        ).rejects.toMatchObject({ code: "READ_ONLY" });
        expect(await readdir(root)).toEqual([]);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 20_000);

  it.each([
    ["components:publish", []],
    ["integrations:import", []],
    ["integrations:convert", ["integration-id"]],
    ["integrations:flows:test", ["integration-id", "flow-name"]],
  ] as const)("still blocks %s before executing remote work", async (name, args) => {
    await expect(
      runCommand(Commands[name], [...args, "--agent", "--yes", "--read-only"]),
    ).rejects.toMatchObject({ code: "READ_ONLY" });
  });
});

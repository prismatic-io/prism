import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

describe("CLI error output", () => {
  it("prints ordinary errors before exiting non-zero", () => {
    const script = `
      import { handle } from "@oclif/core";
      import { processError } from "./src/errors.ts";
      await handle(processError(new TypeError("ordinary failure")));
    `;
    const result = spawnSync("bun", ["--eval", script], {
      cwd: projectRoot,
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).toMatch(/TypeError: ordinary failure/);
  });
});

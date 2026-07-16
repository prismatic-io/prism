import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const runPath = fileURLToPath(new URL("./run.ts", import.meta.url));

describe("CLI error output", () => {
  it("prints ordinary errors before exiting non-zero", () => {
    const result = spawnSync("bun", [runPath, "me"], {
      cwd: path.dirname(path.dirname(runPath)),
      encoding: "utf8",
      env: {
        ...process.env,
        PRISM_ACCESS_TOKEN: "",
        PRISM_CONFIG_FILE: path.join(tmpdir(), `prism-missing-${process.pid}.yml`),
        PRISM_REFRESH_TOKEN: "",
        PRISM_SKIP_NEW_VERSION_CHECK: "true",
        PRISMATIC_URL: "not-a-url",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).toMatch(/TypeError:.*(cannot be parsed|invalid url)/i);
  });
});

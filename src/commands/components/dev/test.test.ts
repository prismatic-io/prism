import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withWorkingDirectory } from "../../../command-context.js";
import { getRuntimeEnvironment } from "../../../runtime.js";
import { whoAmI } from "../../../utils/user/query.js";
import { runCommand } from "../../../test-command.js";
import { describe, expect, it, vi } from "vitest";
import { spawnProcess } from "../../../utils/process.js";
import Command from "./test.js";

vi.mock(import("../../../utils/process.js"), () => ({
  spawnProcess: vi.fn(),
}));

describe("components:dev:test agent input validation", () => {
  it("requires an action before building or making API requests", async () => {
    await expect(runCommand(Command, ["--agent", "--yes"])).rejects.toMatchObject({
      exitCode: 2,
    });

    expect(spawnProcess).not.toHaveBeenCalled();
  });

  it.each([
    ["--action-inputs", "not-json"],
    ["--connection-inputs", "[]"],
  ])("rejects invalid %s before building or making API requests", async (flag, value) => {
    await expect(
      runCommand(Command, ["--agent", "--yes", "--action", "example", flag, value]),
    ).rejects.toMatchObject({ exitCode: 2 });

    expect(spawnProcess).not.toHaveBeenCalled();
  });
});

vi.mock(import("../../../utils/user/query.js"), () => ({ whoAmI: vi.fn() }));

it("loads dotenv from each invocation directory without changing process environment", async () => {
  const original = process.env.PRISM_SUBSTRATE_ENV_TEST;
  const directories = await Promise.all(
    [0, 1].map(() => mkdtemp(join(tmpdir(), "prism-dev-env-"))),
  );
  const observed: string[] = [];
  vi.mocked(whoAmI).mockImplementation(async () => {
    observed.push(getRuntimeEnvironment().PRISM_SUBSTRATE_ENV_TEST ?? "missing");
    throw new Error("stop after environment loading");
  });
  try {
    await Promise.all(
      directories.map(async (directory, index) => {
        await writeFile(join(directory, ".env"), `PRISM_SUBSTRATE_ENV_TEST=value-${index}\n`);
        await expect(
          withWorkingDirectory(directory, () =>
            runCommand(Command, ["--agent", "--yes", "--no-build", "--action", "example"]),
          ),
        ).rejects.toThrow("stop after environment loading");
      }),
    );
    expect(observed.sort()).toEqual(["value-0", "value-1"]);
    expect(process.env.PRISM_SUBSTRATE_ENV_TEST).toBe(original);
  } finally {
    await Promise.all(
      directories.map((directory) => rm(directory, { recursive: true, force: true })),
    );
  }
});

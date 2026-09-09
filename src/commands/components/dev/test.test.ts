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

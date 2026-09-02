import { afterEach, describe, expect, it } from "vitest";
import { defineCommand } from "./command.js";
import { ux } from "./utils/ux.js";

const environmentCommand = defineCommand({
  run: () => ({ output: [] }),
});

afterEach(() => {
  delete process.env.PRISMATIC_PRINT_REQUESTS;
  delete process.env.PRISM_QUIET;
});

describe("command environment compatibility", () => {
  it("leaves presence-checked switches absent by default", async () => {
    await environmentCommand.run([]);
    expect(process.env.PRISMATIC_PRINT_REQUESTS).toBeUndefined();
    expect(process.env.PRISM_QUIET).toBeUndefined();
  });

  it("sets presence-checked switches only when enabled", async () => {
    await environmentCommand.run(["--print-requests", "--quiet"]);
    expect(process.env.PRISMATIC_PRINT_REQUESTS).toBe("true");
    expect(process.env.PRISM_QUIET).toBe("true");
  });
});

describe("agent interaction safety", () => {
  it("does not emit an orphaned action-stop message", async () => {
    const command = defineCommand({
      run: () => {
        ux.action.start("working");
        ux.action.stop();
        return { ok: true };
      },
    });

    await expect(command.run(["--agent"])).resolves.toEqual({ ok: true });
  });
});

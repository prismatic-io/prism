import inquirer from "inquirer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { applyCommandPolicy } from "../command.js";
import { runCommand } from "../test-command.js";
import { confirm, pressAnyKey } from "./prompts.js";

vi.mock(import("inquirer"), () => ({
  default: { prompt: vi.fn() },
}));

const confirmCommand = applyCommandPolicy({
  async run() {
    return { confirmed: await confirm("Proceed?") };
  },
});

const continueCommand = applyCommandPolicy({
  async run() {
    await pressAnyKey("Press any key");
    return { continued: true };
  },
});

const setTty = (isTTY: boolean | undefined) =>
  Object.defineProperty(process.stdin, "isTTY", { value: isTTY, configurable: true });

describe("confirm", () => {
  const originalTty = process.stdin.isTTY;

  afterEach(() => {
    setTty(originalTty);
    vi.mocked(inquirer.prompt).mockReset();
  });

  it("approves without prompting when --yes is provided in a terminal", async () => {
    setTty(true);
    await expect(runCommand(confirmCommand, ["--yes"])).resolves.toEqual({ confirmed: true });
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it("prompts interactively in a terminal without --yes", async () => {
    setTty(true);
    vi.mocked(inquirer.prompt).mockResolvedValue({ value: false } as never);
    await expect(runCommand(confirmCommand, [])).resolves.toEqual({ confirmed: false });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
  });

  it("requires --yes when standard input is not a terminal", async () => {
    setTty(undefined);
    await expect(runCommand(confirmCommand, [])).rejects.toMatchObject({
      code: "CONFIRMATION_REQUIRED",
      exitCode: 2,
    });
    await expect(runCommand(confirmCommand, ["--yes"])).resolves.toEqual({ confirmed: true });
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it("requires --yes in agent mode even in a terminal", async () => {
    setTty(true);
    await expect(runCommand(confirmCommand, ["--agent"])).rejects.toMatchObject({
      code: "CONFIRMATION_REQUIRED",
    });
    await expect(runCommand(confirmCommand, ["--agent", "--yes"])).resolves.toEqual({
      confirmed: true,
    });
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });
});

describe("pressAnyKey", () => {
  const originalTty = process.stdin.isTTY;

  afterEach(() => {
    setTty(originalTty);
  });

  it("continues without input when --yes is provided", async () => {
    setTty(undefined);
    await expect(runCommand(continueCommand, ["--yes"])).resolves.toEqual({ continued: true });
  });

  it("requires --yes when standard input is not a terminal", async () => {
    setTty(undefined);
    await expect(runCommand(continueCommand, [])).rejects.toMatchObject({
      code: "CONFIRMATION_REQUIRED",
    });
  });
});

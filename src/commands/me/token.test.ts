import { describe, expect, it, vi } from "vitest";
import { getStdout } from "../../../vitest.setup.js";
import { getAuthContext } from "../../context.js";
import { runCommand } from "../../test-command.js";
import PrintTokenCommand from "./token.js";

describe("me:token", () => {
  it("returns the refresh token from the active environment session", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "environment",
      url: "https://ci.example.io",
      refreshToken: "environment-refresh-token",
    });

    const result = await runCommand(PrintTokenCommand, ["--type", "refresh"]);
    expect(result).toEqual({ token: "environment-refresh-token", type: "refresh" });
    expect(PrintTokenCommand.output.safeParse(result).success).toBe(true);
  });

  it("prints only the bare access token to stdout for humans", async () => {
    await runCommand(PrintTokenCommand, []);
    expect(getStdout()).toBe("test-token\n");
  });

  it("returns the structured token to agents without printing it", async () => {
    const result = await runCommand(PrintTokenCommand, ["--agent"]);
    expect(result).toEqual({ token: "test-token", type: "access" });
    expect(getStdout()).toBe("");
  });
});

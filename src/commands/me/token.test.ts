import { runCommand } from "../../test-command.js";
import { describe, expect, it, vi } from "vitest";
import { getAuthContext } from "../../context.js";
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
});

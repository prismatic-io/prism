import { describe, expect, it, vi } from "vitest";
import { getAuthContext } from "../../context.js";
import { getStdout } from "../../../vitest.setup.js";
import PrintTokenCommand from "./token.js";

describe("me:token", () => {
  it("prints the refresh token from the active environment session", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "environment",
      url: "https://ci.example.io",
      refreshToken: "environment-refresh-token",
    });

    await PrintTokenCommand.run(["--type", "refresh"]);

    expect(getStdout()).toContain("environment-refresh-token");
  });
});

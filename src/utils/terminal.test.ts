import { describe, expect, it, vi } from "vitest";
import { hyperlink } from "./terminal.js";

// Force the fallback branch — terminal-link's own support detection is env-dependent.
vi.mock(import("terminal-link"), () => ({
  default: (text: string, uri: string, opts?: { fallback?: (t: string, u: string) => string }) =>
    opts?.fallback ? opts.fallback(text, uri) : `${text} (${uri})`,
}));

describe("hyperlink", () => {
  it("returns only the raw URI on the fallback path", () => {
    const out = hyperlink("Authorize URL", "https://example.com/auth");
    expect(out).toBe("https://example.com/auth");
    expect(out).not.toContain("Authorize URL");
  });
});

import { describe, expect, it } from "vitest";
import { diagnosticText } from "./diagnostic.js";

const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.synthetic_signature";

describe("diagnostic credential protection", () => {
  it("redacts authenticated request dumps without needing the original error object", () => {
    const raw = `AxiosError: 401\nconfig: {headers: {Authorization: 'Bearer ${token}', 'x-api-key': 'private-api-key', Cookie: 'session=private-session'}}\nrequest: {path: '/api'}\naccess_token: "other-secret"`;
    const result = diagnosticText(raw, {});
    for (const secret of [token, "private-api-key", "private-session", "other-secret"])
      expect(result).not.toContain(secret);
    expect(result).toContain("AxiosError: 401");
    expect(result).toContain("/api");
  });

  it("redacts standalone JWTs and opaque runtime credentials before bounding the text", () => {
    const result = diagnosticText(`opaque-password ${token} ${"x".repeat(20_000)}`, {
      PRISM_ACCESS_TOKEN: "opaque-password",
    });
    expect(result).not.toContain("opaque-password");
    expect(result).not.toContain(token);
    expect(result.length).toBeLessThan(8300);
    expect(result).toContain("truncated");
  });
});

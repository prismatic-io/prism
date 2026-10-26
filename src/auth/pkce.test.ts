import { expect, it } from "vitest";
import { codeChallenge, createPkce } from "./pkce.js";

it("matches the RFC 7636 S256 test vector", () => {
  expect(codeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
    "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  );
});

it("creates independent 256-bit verifier and state values for each login", () => {
  const first = createPkce();
  const second = createPkce();
  for (const value of [first.verifier, first.state, second.verifier, second.state]) {
    expect(value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Buffer.from(value, "base64url")).toHaveLength(32);
  }
  expect(new Set([first.verifier, first.state, second.verifier, second.state]).size).toBe(4);
  expect(first.challenge).toBe(codeChallenge(first.verifier));
});

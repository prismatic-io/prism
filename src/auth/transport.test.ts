import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  authorizationUrl,
  createRequestParams,
  exchangeCode,
  getAuthOptions,
  logoutUrl,
  refreshToken,
  revokeToken,
  stackEndpoint,
} from "./transport.js";
import type { AuthenticationOptions } from "./types.js";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const options: AuthenticationOptions = {
  domain: "auth.example.com",
  clientId: "client",
  audience: "https://api.example.com",
  scopes: ["openid", "offline_access"],
  successRedirectUri: "https://prismatic.io",
};
const tokens = {
  access_token: "access-secret",
  refresh_token: "refresh-new",
  expires_in: 3600,
  token_type: "Bearer",
  scope: "openid",
};
const input = {
  verifier: "verifier-secret",
  code: "code+/= with space",
  redirectUri: "http://localhost:59400/",
};

it("encodes form keys and values and omits only undefined values", () => {
  expect(
    new URLSearchParams(createRequestParams({ "a b": "x+y&z=", empty: "", missing: undefined })),
  ).toEqual(
    new URLSearchParams([
      ["a b", "x+y&z="],
      ["empty", ""],
    ]),
  );
});

it("exchanges decoded codes with the exact verifier and registered redirect URI", async () => {
  server.use(
    http.post("https://auth.example.com/oauth/token", async ({ request }) => {
      expect(request.headers.get("content-type")).toBe("application/x-www-form-urlencoded");
      expect(Object.fromEntries(new URLSearchParams(await request.text()))).toEqual({
        grant_type: "authorization_code",
        client_id: "client",
        code_verifier: input.verifier,
        code: input.code,
        redirect_uri: input.redirectUri,
      });
      return HttpResponse.json(tokens);
    }),
  );
  await expect(exchangeCode(options, input)).resolves.toEqual({
    accessToken: "access-secret",
    refreshToken: "refresh-new",
    expiresIn: 3600,
    scope: "openid",
    tokenType: "Bearer",
  });
});

it.each([true, false])("preserves rotation when replacement is present: %s", async (rotated) => {
  server.use(
    http.post("https://auth.example.com/oauth/token", async ({ request }) => {
      expect(Object.fromEntries(new URLSearchParams(await request.text()))).toEqual({
        grant_type: "refresh_token",
        client_id: "client",
        refresh_token: "refresh-old",
        tenant_id: "tenant",
      });
      return HttpResponse.json({ ...tokens, refresh_token: rotated ? "refresh-new" : undefined });
    }),
  );
  await expect(refreshToken(options, "refresh-old", "tenant")).resolves.toMatchObject({
    refreshToken: rotated ? "refresh-new" : "refresh-old",
    tenantId: "tenant",
  });
});

it.each([
  [400, { error: "invalid_grant", error_description: "refresh-secret" }, "Log in again"],
  [403, { error: "access_denied", error_description: "access-secret" }, "Access denied"],
  [500, tokens, "HTTP 500"],
  [200, { ...tokens, access_token: "" }, "invalid token response"],
  [200, { ...tokens, expires_in: -1 }, "invalid token response"],
  [200, { ...tokens, token_type: "Other" }, "invalid token response"],
  [200, { error: "arbitrary-secret" }, "rejected the token request"],
])("rejects unsafe token response %s without reflecting secrets", async (status, body, message) => {
  server.use(
    http.post("https://auth.example.com/oauth/token", () => HttpResponse.json(body, { status })),
  );
  await expect(exchangeCode(options, input)).rejects.toThrow(message);
});

it("requires a refresh token from the initial exchange", async () => {
  server.use(
    http.post("https://auth.example.com/oauth/token", () =>
      HttpResponse.json({ ...tokens, refresh_token: undefined }),
    ),
  );
  await expect(exchangeCode(options, input)).rejects.toThrow("did not return a refresh token");
});

it("does not expose malformed response bodies", async () => {
  server.use(
    http.post("https://auth.example.com/oauth/token", () =>
      HttpResponse.text("private verifier-secret"),
    ),
  );
  await expect(exchangeCode(options, input)).rejects.toThrow("invalid JSON response");
});

it.each([
  307, 308,
])("does not forward token request bodies through HTTP %s redirects", async (status) => {
  const destination = vi.fn(() => HttpResponse.json(tokens));
  server.use(
    http.post(
      "https://auth.example.com/oauth/token",
      () =>
        new HttpResponse(null, {
          status,
          headers: { Location: "http://attacker.example.com/token" },
        }),
    ),
    http.post("http://attacker.example.com/token", destination),
  );
  await expect(exchangeCode(options, input)).rejects.toThrow();
  expect(destination).not.toHaveBeenCalled();
});

it("cancels an in-flight token request", async () => {
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    started = resolve;
  });
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  server.use(
    http.post("https://auth.example.com/oauth/token", async () => {
      started();
      await released;
      return HttpResponse.json(tokens);
    }),
  );
  const abort = new AbortController();
  const exchanging = exchangeCode(options, { ...input, signal: abort.signal });
  const assertion = expect(exchanging).rejects.toThrow("cancelled");
  await pending;
  abort.abort(new Error("cancelled"));
  await assertion;
  release();
});

it("rejects an already cancelled operation before issuing a request", async () => {
  const handler = vi.fn(() => HttpResponse.json(tokens));
  server.use(http.post("https://auth.example.com/oauth/token", handler));
  await expect(
    refreshToken(options, "secret", undefined, AbortSignal.abort(new Error("cancelled"))),
  ).rejects.toThrow("cancelled");
  expect(handler).not.toHaveBeenCalled();
});

it("loads and validates authentication metadata", async () => {
  server.use(
    http.get("https://stack.example.com/auth/meta", () =>
      HttpResponse.json({
        domain: options.domain,
        clientId: options.clientId,
        audience: options.audience,
      }),
    ),
  );
  await expect(getAuthOptions("https://stack.example.com")).resolves.toMatchObject({
    domain: options.domain,
    clientId: options.clientId,
    audience: options.audience,
    scopes: ["openid", "profile", "email", "offline_access"],
  });
});

it.each([
  "",
  "https://auth.example.com",
  "user@auth.example.com",
  "auth.example.com/path",
  "auth.example.com?query",
  "auth.example.com\\path",
  "a..example.com",
])("rejects malformed metadata domain %j", async (domain) => {
  server.use(
    http.get("https://stack.example.com/auth/meta", () =>
      HttpResponse.json({ domain, clientId: "client", audience: "audience" }),
    ),
  );
  await expect(getAuthOptions("https://stack.example.com")).rejects.toThrow(
    /invalid (metadata|domain)/,
  );
});

it("rejects metadata failure and redirection", async () => {
  server.use(
    http.get("https://stack.example.com/auth/meta", () => new HttpResponse(null, { status: 503 })),
  );
  await expect(getAuthOptions("https://stack.example.com")).rejects.toThrow("HTTP 503");
  server.use(
    http.get("https://stack.example.com/auth/meta", () =>
      HttpResponse.redirect("https://other.example.com/meta", 302),
    ),
  );
  await expect(getAuthOptions("https://stack.example.com")).rejects.toThrow();
});

describe("stack transport policy", () => {
  it.each([
    "http://stack.example.com",
    "http://localhost:8000",
    "https://user:secret@stack.example.com",
    "file:///tmp/meta",
  ])("rejects unsafe endpoint %s", async (url) => {
    await expect(getAuthOptions(url)).rejects.toThrow(/HTTPS/);
    await expect(revokeToken(url, "secret")).rejects.toThrow(/HTTPS/);
  });
  it.each([
    "http://127.0.0.1:8000",
    "http://[::1]:8000",
    "https://stack.example.com",
  ])("accepts explicit endpoint %s", (url) => {
    expect(stackEndpoint(url, "/auth/meta").pathname).toBe("/auth/meta");
  });
});

it.each([401, 403, 500])("does not report revocation success for HTTP %s", async (status) => {
  server.use(
    http.post("https://stack.example.com/auth/revoke", () => new HttpResponse(null, { status })),
  );
  await expect(revokeToken("https://stack.example.com", "refresh-secret")).rejects.toThrow(
    `HTTP ${status}`,
  );
});

it("revokes over HTTPS and accepts the successful empty response", async () => {
  server.use(
    http.post("https://stack.example.com/auth/revoke", async ({ request }) => {
      expect(await request.json()).toEqual({ refresh_token: "refresh-secret" });
      return new HttpResponse(null, { status: 204 });
    }),
  );
  await expect(revokeToken("https://stack.example.com", "refresh-secret")).resolves.toBeUndefined();
});

it("does not follow revocation redirects", async () => {
  const destination = vi.fn(() => new HttpResponse(null, { status: 204 }));
  server.use(
    http.post(
      "https://stack.example.com/auth/revoke",
      () =>
        new HttpResponse(null, {
          status: 307,
          headers: { Location: "https://other.example.com/revoke" },
        }),
    ),
    http.post("https://other.example.com/revoke", destination),
  );
  await expect(revokeToken("https://stack.example.com", "secret")).rejects.toThrow();
  expect(destination).not.toHaveBeenCalled();
});

it("builds browser URLs with standard query encoding", () => {
  const url = new URL(
    authorizationUrl(options, {
      challenge: "challenge",
      state: "state",
      redirectUri: input.redirectUri,
    }),
  );
  expect(url).toMatchObject({ origin: "https://auth.example.com", pathname: "/authorize" });
  expect(Object.fromEntries(url.searchParams)).toEqual({
    response_type: "code",
    code_challenge: "challenge",
    code_challenge_method: "S256",
    client_id: "client",
    redirect_uri: input.redirectUri,
    scope: "openid offline_access",
    state: "state",
    audience: options.audience,
  });
  const logout = new URL(logoutUrl(options));
  expect(logout).toMatchObject({ origin: "https://auth.example.com", pathname: "/logout" });
  expect(Object.fromEntries(logout.searchParams)).toEqual({
    client_id: options.clientId,
    returnTo: options.successRedirectUri,
  });
});

it("accepts the case-insensitive Bearer token type", async () => {
  server.use(
    http.post("https://auth.example.com/oauth/token", () =>
      HttpResponse.json({ ...tokens, token_type: "bearer" }),
    ),
  );
  await expect(exchangeCode(options, input)).resolves.toMatchObject({ tokenType: "Bearer" });
});

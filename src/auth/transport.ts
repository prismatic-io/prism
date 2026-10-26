import { isIP } from "node:net";
import { z } from "zod";
import { fetch } from "../utils/http.js";
import type { Auth, AuthenticationOptions } from "./types.js";

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().nonnegative(),
  refresh_token: z.string().min(1).optional(),
  scope: z.string().default(""),
  token_type: z
    .string()
    .refine((value) => value.toLowerCase() === "bearer")
    .transform(() => "Bearer"),
});

const authConfigSchema = z.object({
  domain: z.string().min(1),
  clientId: z.string().min(1),
  audience: z.string().min(1),
});

/** Auth0 metadata contains an authority, not a URL or arbitrary URL prefix. */
const authUrl = (domain: string, pathname: string): URL => {
  if (!/^(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::[0-9]+)?$/i.test(domain)) {
    throw new Error("Authentication metadata contains an invalid domain.");
  }
  let url: URL;
  try {
    url = new URL(`https://${domain}`);
  } catch {
    throw new Error("Authentication metadata contains an invalid domain.");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    !isIP(hostname) &&
    !hostname.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))
  ) {
    throw new Error("Authentication metadata contains an invalid domain.");
  }
  url.pathname = pathname;
  return url;
};

/** HTTP is reserved for an explicitly configured local development endpoint. */
export const stackEndpoint = (stackUrl: string, pathname: string): URL => {
  let url: URL;
  try {
    url = new URL(stackUrl);
  } catch {
    throw new Error("Prismatic endpoint must be a valid HTTPS URL.");
  }
  const localHttp =
    url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "[::1]");
  if ((url.protocol !== "https:" && !localHttp) || url.username || url.password) {
    throw new Error(
      "Prismatic endpoint must use HTTPS (HTTP is allowed only on literal loopback addresses).",
    );
  }
  return new URL(pathname, url);
};

export const createRequestParams = (data: Record<string, string | undefined>): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) params.set(key, value);
  }
  return params.toString();
};

const readJson = async (response: Awaited<ReturnType<typeof fetch>>, signal?: AbortSignal) => {
  try {
    const value: unknown = await response.json();
    signal?.throwIfAborted();
    return value;
  } catch {
    signal?.throwIfAborted();
    throw new Error("Authentication server returned an invalid JSON response.");
  }
};

const tokenRequest = async (
  options: AuthenticationOptions,
  data: Record<string, string | undefined>,
  signal?: AbortSignal,
) => {
  signal?.throwIfAborted();
  const response = await fetch(authUrl(options.domain, "/oauth/token").toString(), {
    method: "POST",
    body: createRequestParams({ ...data, client_id: options.clientId }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    redirect: "error",
    signal,
  });
  const body = await readJson(response, signal);
  // Never reflect error_description or arbitrary provider text: either can contain credentials.
  const error = z.object({ error: z.string() }).safeParse(body);
  if (error.success) {
    if (error.data.error === "access_denied") {
      throw new Error(
        "Access denied. You do not have access to the requested authentication session or tenant.",
      );
    }
    if (error.data.error === "invalid_grant") {
      throw new Error("Authentication grant expired or is invalid. Log in again.");
    }
    throw new Error("Authentication server rejected the token request.");
  }
  if (!response.ok)
    throw new Error(`Authentication token request failed (HTTP ${response.status}).`);
  const parsed = tokenResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("Authentication server returned an invalid token response.");
  return parsed.data;
};

export const getAuthOptions = async (
  stackUrl: string,
  signal?: AbortSignal,
): Promise<AuthenticationOptions> => {
  signal?.throwIfAborted();
  const response = await fetch(stackEndpoint(stackUrl, "/auth/meta").toString(), {
    redirect: "error",
    signal,
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Authentication metadata request failed (HTTP ${response.status}).`);
  }
  const parsed = authConfigSchema.safeParse(await readJson(response, signal));
  if (!parsed.success) throw new Error("Authentication server returned invalid metadata.");
  authUrl(parsed.data.domain, "/authorize");
  return {
    ...parsed.data,
    scopes: ["openid", "profile", "email", "offline_access"],
    successRedirectUri: "https://prismatic.io",
  };
};

export const exchangeCode = async (
  options: AuthenticationOptions,
  input: { verifier: string; code: string; redirectUri: string; signal?: AbortSignal },
): Promise<Auth> => {
  const response = await tokenRequest(
    options,
    {
      grant_type: "authorization_code",
      client_id: options.clientId,
      code_verifier: input.verifier,
      code: input.code,
      redirect_uri: input.redirectUri,
    },
    input.signal,
  );
  if (!response.refresh_token)
    throw new Error("Authentication server did not return a refresh token.");
  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
    refreshToken: response.refresh_token,
    scope: response.scope,
    tokenType: response.token_type,
  };
};

export const refreshToken = async (
  options: AuthenticationOptions,
  token: string,
  tenantId?: string,
  signal?: AbortSignal,
): Promise<Auth> => {
  const response = await tokenRequest(
    options,
    {
      grant_type: "refresh_token",
      client_id: options.clientId,
      refresh_token: token,
      tenant_id: tenantId,
    },
    signal,
  );
  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
    refreshToken: response.refresh_token ?? token,
    scope: response.scope,
    tokenType: response.token_type,
    tenantId,
  };
};

export const revokeToken = async (
  stackUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<void> => {
  signal?.throwIfAborted();
  const response = await fetch(stackEndpoint(stackUrl, "/auth/revoke").toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
    redirect: "error",
    signal,
  });
  await response.body?.cancel();
  signal?.throwIfAborted();
  if (!response.ok) throw new Error(`Refresh token revocation failed (HTTP ${response.status}).`);
};

export const authorizationUrl = (
  options: AuthenticationOptions,
  input: { challenge: string; state: string; redirectUri: string },
): string => {
  const url = authUrl(options.domain, "/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    code_challenge: input.challenge,
    code_challenge_method: "S256",
    client_id: options.clientId,
    redirect_uri: input.redirectUri,
    scope: options.scopes.join(" "),
    state: input.state,
    audience: options.audience,
  }).toString();
  return url.toString();
};

export const logoutUrl = (options: AuthenticationOptions): string => {
  const url = authUrl(options.domain, "/logout");
  url.search = new URLSearchParams({
    client_id: options.clientId,
    returnTo: options.successRedirectUri,
  }).toString();
  return url.toString();
};

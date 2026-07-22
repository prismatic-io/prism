import crypto from "crypto";
import http from "http";
import { jwtDecode } from "jwt-decode";
import inquirer from "inquirer";
import chalk from "chalk";
import { deleteProfile, getActiveProfileName, writeActiveProfile } from "./config.js";
import { type AuthContext, getAuthContext, getPrismaticUrl } from "./context.js";
import { gqlRequest, gql } from "./graphql.js";
import type { AddressInfo } from "net";
import open from "open";
import { whoAmI } from "./utils/user/query.js";
import { fetch } from "./utils/http.js";

const urlEncodeBase64 = (value: Buffer | string): string => {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;

  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const codeVerifier = (): string => urlEncodeBase64(crypto.randomBytes(32));

const sha256 = (buffer: Buffer | string): Buffer =>
  crypto.createHash("sha256").update(buffer).digest();

const codeChallenge = (verifier: string): string => urlEncodeBase64(sha256(verifier));

const codeState = (): string => urlEncodeBase64(crypto.randomBytes(12));

const httpsUrl = (host: string, pathname: string): URL => {
  const result = new URL("https://localhost");
  result.host = host;
  result.pathname = pathname;
  return result;
};

const randomPort = (low: number, high: number): number =>
  Math.floor(Math.random() * (high - low + 1) + low);

const extractRequestParams = (url: string): Record<string, string> => {
  const paramRegex = new RegExp(/([a-z]+)=([^=&]+)/, "g");
  const params: Record<string, string> = {};
  let param: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: TODO
  while ((param = paramRegex.exec(url)) !== null) {
    params[`${param[1]}`] = param[2];
  }

  return params;
};

export const createRequestParams = (data: Record<string, string | undefined>): string =>
  Object.entries(data).reduce((result, [key, value]) => {
    if (value === undefined) return result;

    const part = `${key}=${encodeURIComponent(value)}`;
    if (result === "") {
      return `${part}`;
    }

    return `${result}&${part}`;
  }, "");

const validateAuthorizationToken = async (url: string, expectedState: string): Promise<string> => {
  const { code, state } = extractRequestParams(url);

  if (state !== expectedState) {
    throw new Error("Unexpected state value returned.");
  }

  if (code === undefined) {
    throw new Error("Did not receive authorization code");
  }

  return code;
};

/** Auth payload containing authentication information */
export interface Auth {
  /** Access token to use for authorizing user */
  accessToken: string;
  /** Token expiration in seconds */
  expiresIn: number;
  /** Refresh token for offline token renewal */
  refreshToken: string;
  /** Acquired scopes for the token */
  scope: string;
  /** Type of token */
  tokenType: string;
  /** Tenant ID for multi-tenant support */
  tenantId?: string;
}

/**
 * Defines options that Authenticate accepts.
 */
export interface AuthenticationOptions {
  /** Auth0 domain for client specified with clientId */
  domain: string;
  /** Auth0 Client Identifier specifying client to use for auth attempts */
  clientId: string;
  /** Auth0 API Audience to specify the API to authorize for */
  audience: string;
  /** Array of scopes to request */
  scopes: string[];
  /** Uri to redirect user to upon successful auth */
  successRedirectUri: string;
}

/** Auth0's
 * @see {@link https://auth0.com/docs/flows/concepts/auth-code-pkce | Authorization Code Flow with Proof Key for Code Exchange (PKCE)}
 * authentication flow.
 */
export class Authenticate {
  private readonly options: AuthenticationOptions;
  private redirectServer!: http.Server;

  /**
   * Create new Authenticate instance
   * @param options Authentication options to configure Auth0 PKCE flow
   */
  constructor(options: AuthenticationOptions) {
    this.options = options;
  }

  /**
   * Start the PKCE authentication flow
   * @returns Promise containing authentication result
   */
  async login(props?: { url?: boolean }): Promise<Auth> {
    const verifier = codeVerifier();
    const challenge = codeChallenge(verifier);
    const state = codeState();

    const redirectUri = await this.createRedirectServer();

    if (props?.url) {
      const challengeUrl = await this.getChallengeUrl(challenge, state, redirectUri);
      console.log(challengeUrl);
    } else {
      await this.openChallengeBrowser(challenge, state, redirectUri);
    }

    return new Promise<Auth>((resolve, reject) => {
      // Close the redirect server if we don't get a response
      const timeoutHandle = setTimeout(this.redirectServer.close, 3 * 60 * 1000);

      this.redirectServer.on("request", (request, response) => {
        clearTimeout(timeoutHandle);

        response.writeHead(301, {
          Location: this.options.successRedirectUri,
        });
        response.end();

        this.redirectServer.close();

        validateAuthorizationToken(request.url || "", state)
          .then(async (authorizationToken) =>
            this.retrieveAuthenticationToken(verifier, authorizationToken, redirectUri),
          )
          .then(resolve)
          .catch(reject);
      });
    });
  }

  async refresh(refreshToken: string, tenantId?: string): Promise<Auth> {
    const data = {
      grant_type: "refresh_token",
      client_id: this.options.clientId,
      refresh_token: refreshToken,
      tenant_id: tenantId,
    };

    const fetchResponse = await fetch(httpsUrl(this.options.domain, "/oauth/token").toString(), {
      method: "POST",
      body: createRequestParams(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const response = (await fetchResponse.json()) as any;

    if (response.error === "access_denied") {
      const description =
        response.error_description || "You do not have access to the specified tenant.";
      throw new Error(
        `Access denied${tenantId ? ` for tenant ID '${tenantId}'` : ""}. ${description}`,
      );
    }

    return {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken,
      scope: response.scope,
      tokenType: response.token_type,
      tenantId,
    };
  }

  async logout(): Promise<void> {
    const params = {
      client_id: this.options.clientId,
      returnTo: this.options.successRedirectUri,
    };
    const logoutUrl = httpsUrl(this.options.domain, "/logout");
    logoutUrl.search = new URLSearchParams(params).toString();
    await open(logoutUrl.toString());
  }

  private async attemptServerCreate(): Promise<http.Server> {
    return new Promise<http.Server>((resolve, reject) => {
      const server = http
        .createServer()
        .on("error", (e) => {
          server.close();
          reject(e);
        })
        .listen(randomPort(59400, 59450), "localhost", () => resolve(server));
    });
  }

  private async retry<T>(retries: number, fn: () => Promise<T>): Promise<T> {
    return fn().catch(async (e) => (retries > 1 ? this.retry(retries - 1, fn) : Promise.reject(e)));
  }

  private async createRedirectServer(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.retry(5, this.attemptServerCreate)
        .then((server) => {
          this.redirectServer = server;
          const info = server.address() as AddressInfo;
          const redirectUrl = new URL("http://localhost");
          redirectUrl.port = String(info.port);
          resolve(redirectUrl.toString());
        })
        .catch(reject);
    });
  }

  private async retrieveAuthenticationToken(
    verifier: string,
    code: string,
    redirectUri: string,
  ): Promise<Auth> {
    const data = {
      grant_type: "authorization_code",
      client_id: this.options.clientId,
      code_verifier: verifier,
      code,
      redirect_uri: redirectUri,
    };

    const fetchResponse = await fetch(httpsUrl(this.options.domain, "/oauth/token").toString(), {
      method: "POST",
      body: createRequestParams(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const response = (await fetchResponse.json()) as any;
    return {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
      scope: response.scope,
      tokenType: response.token_type,
    };
  }

  private async openChallengeBrowser(
    challenge: string,
    state: string,
    redirectUri: string,
  ): Promise<void> {
    const challengeUrl = await this.getChallengeUrl(challenge, state, redirectUri);

    await open(challengeUrl);
  }

  private async getChallengeUrl(challenge: string, state: string, redirectUri: string) {
    const { clientId, audience, scopes } = this.options;
    const params = {
      response_type: "code",
      code_challenge: challenge,
      code_challenge_method: "S256",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
      state,
      audience,
    };
    const authorizeUrl = httpsUrl(this.options.domain, "/authorize");
    authorizeUrl.search = new URLSearchParams(params).toString();
    return authorizeUrl.toString();
  }
}

// TODO: Need to factor this out if we look to open source this auth logic.
const getAuthOptions = async (prismaticUrl?: string) => {
  const resolvedUrl = prismaticUrl ?? (await getPrismaticUrl());
  const fetchResponse = await fetch(new URL("/auth/meta", resolvedUrl).toString());
  const authConfig = (await fetchResponse.json()) as any;

  const { domain, clientId, audience } = authConfig;
  return {
    domain,
    clientId,
    audience,
    scopes: ["openid", "profile", "email", "offline_access"],
    successRedirectUri: "https://prismatic.io",
  };
};

export interface Tenant {
  tenantId: string;
  url: string;
  orgName: string;
  awsRegion: string;
  systemSuspended: boolean;
}

interface ListUserTenantsResponse {
  listUserTenants: {
    nodes: Tenant[];
  };
}

export const fetchUserTenants = async (): Promise<Tenant[]> => {
  const result = await gqlRequest<ListUserTenantsResponse>({
    document: gql`
      query ListUserTenants {
        listUserTenants {
          nodes {
            tenantId
            url
            orgName
            awsRegion
            systemSuspended
          }
        }
      }
    `,
  });

  return result.listUserTenants.nodes;
};

export const selectTenant = async (
  tenants: Tenant[],
  options: {
    currentTenantId?: string;
    message?: string;
  } = {},
): Promise<string | undefined> => {
  const { currentTenantId, message = "Select a tenant:" } = options;

  const currentTenant = tenants.find((t) => t.tenantId === currentTenantId);
  const currentTenantSuspended = currentTenant?.systemSuspended ?? false;

  const activeTenants = tenants.filter((t) => !t.systemSuspended);
  if (activeTenants.length === 0) {
    console.log(
      chalk.red(
        "You have no active tenants on this stack. Please contact Prismatic support for assistance.",
      ),
    );
    return;
  }

  const effectiveCurrentId = currentTenantSuspended ? undefined : currentTenantId;

  const choices = activeTenants.map((tenant) => {
    const isCurrent = tenant.tenantId === effectiveCurrentId;
    const checkmark = isCurrent ? chalk.green("✓ ") : "  ";
    const label = `${tenant.orgName} - ${tenant.url} (${tenant.awsRegion})`;
    const displayName = isCurrent ? chalk.green(label) : label;

    return {
      name: `${checkmark}${displayName}`,
      value: tenant.tenantId,
      short: tenant.orgName,
    };
  });

  try {
    const { tenantId } = await inquirer.prompt<{ tenantId: string }>([
      {
        type: "select",
        name: "tenantId",
        message,
        choices,
        default: effectiveCurrentId,
      },
    ]);

    return tenantId;
    // biome-ignore lint/correctness/noUnusedVariables: TODO
  } catch (error) {
    // User cancelled tenant selection
    return;
  }
};

export const login = async (props?: { url: boolean; profileName?: string }) => {
  const profileName = props?.profileName ?? (await getActiveProfileName());
  const prismaticUrl = await getPrismaticUrl();
  const authOptions = await getAuthOptions(prismaticUrl);
  const auth = new Authenticate(authOptions);

  const initialAuth = await auth.login({ url: props?.url });
  await writeActiveProfile(initialAuth, profileName);

  const tenants = await fetchUserTenants();

  const user = await whoAmI();
  const initialTenantId = user.tenantId;
  const initialTenant = tenants.find((t) => t.tenantId === initialTenantId);
  const initialTenantSuspended = initialTenant?.systemSuspended ?? false;

  if (!initialTenantSuspended && initialTenantId) {
    await writeActiveProfile(
      {
        ...initialAuth,
        tenantId: initialTenantId,
      },
      profileName,
    );
  }

  const activeTenants = tenants.filter((t) => !t.systemSuspended);
  if (!initialTenantSuspended && activeTenants.length <= 1) {
    return;
  }

  const selectedTenantId = await selectTenant(tenants, {
    currentTenantId: initialTenantId,
  });

  if (selectedTenantId) {
    const tenantAuth = await auth.refresh(initialAuth.refreshToken, selectedTenantId);
    await writeActiveProfile(tenantAuth, profileName);
  } else if (initialTenantSuspended) {
    await deleteProfile(profileName);
  }

  return;
};

const refreshAuthentication = async (refreshToken: string, tenantId?: string, url?: string) => {
  const authOptions = await getAuthOptions(url);
  const auth = new Authenticate(authOptions);

  return auth.refresh(refreshToken, tenantId);
};

export const refresh = async (refreshToken: string, tenantId?: string, profileName?: string) => {
  const selectedName = profileName ?? (await getActiveProfileName());
  const response = await refreshAuthentication(refreshToken, tenantId, await getPrismaticUrl());
  await writeActiveProfile(response, selectedName);
  return response;
};

export const logout = async () => {
  const authOptions = await getAuthOptions();
  const auth = new Authenticate(authOptions);
  await auth.logout();
};

/**
 * Attempts to retrieve the access token for the active session. It prefers
 * the environment variables PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN first
 * but will use the config file values if those are not set. This function will
 * also refresh the access token using the provided refresh token if possible.
 */
export const getAccessToken = async (): Promise<string | undefined> => {
  const { source, profileName, accessToken, refreshToken, tenantId, url } = await getAuthContext();

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAuthentication(refreshToken, tenantId, url);
    if (source === "profile") await writeActiveProfile(refreshed, profileName);
    return refreshed.accessToken;
  }

  if (accessToken && refreshToken) {
    const now = Math.floor(Date.now() / 1000);
    const { exp } = jwtDecode<{ exp: number }>(accessToken);

    if (exp - now < 5 * 60) {
      const refreshed =
        source === "environment"
          ? await refreshAuthentication(refreshToken, tenantId, url)
          : await refresh(refreshToken, tenantId, profileName);
      return refreshed.accessToken;
    }
  }

  return accessToken;
};

/**
 * Check if the user is currently logged in. Return true if so, and false otherwise.
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const resolvedContext = await getAuthContext();
  if (!resolvedContext.accessToken && !resolvedContext.refreshToken) {
    return false;
  }

  try {
    await gqlRequest({
      document: gql`
        query {
          authenticatedUser {
            id
          }
        }
      `,
    });
  } catch {
    return false;
  }

  return true;
};

/**
 * Revoke ALL refresh tokens for the logged in user
 */
export const revokeRefreshToken = async (): Promise<AuthContext["source"]> => {
  const authContext = await getAuthContext();
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new Error("You are not currently logged in.");
  }

  await fetch(new URL("/auth/revoke", authContext.url).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: authContext.refreshToken,
    }),
  });
  if (authContext.source === "profile" && authContext.profileName) {
    await deleteProfile(authContext.profileName);
  }
  return authContext.source;
};

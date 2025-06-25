import crypto from "crypto";
import http from "http";
import axios from "axios";
import url from "url";
import jwtDecode from "jwt-decode";
import {
  configFileExists,
  deleteConfig,
  deleteTenantConfig,
  readConfig,
  writeConfig,
} from "./config.js";
import { gqlRequest, gql } from "./graphql.js";
import { AddressInfo } from "net";
import open from "open";

const urlEncodeBase64 = (value: Buffer | string): string => {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;

  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const codeVerifier = (): string => urlEncodeBase64(crypto.randomBytes(32));

const sha256 = (buffer: Buffer | string): Buffer =>
  crypto.createHash("sha256").update(buffer).digest();

const codeChallenge = (verifier: string): string => urlEncodeBase64(sha256(verifier));

const codeState = (): string => urlEncodeBase64(crypto.randomBytes(12));

const randomPort = (low: number, high: number): number =>
  Math.floor(Math.random() * (high - low + 1) + low);

const extractRequestParams = (url: string): Record<string, string> => {
  const paramRegex = new RegExp(/([a-z]+)=([^=&]+)/, "g");
  const params: Record<string, string> = {};
  let param: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions:
  while ((param = paramRegex.exec(url)) !== null) {
    params[`${param[1]}`] = param[2];
  }

  return params;
};

export const prismaticUrl = process.env.PRISMATIC_URL ?? "https://app.prismatic.io";

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

        validateAuthorizationToken(request.url, state)
          .then(async (authorizationToken) =>
            this.retrieveAuthenticationToken(verifier, authorizationToken, redirectUri),
          )
          .then(resolve)
          .catch(reject);
      });
    });
  }

  async refresh(refreshToken: string): Promise<Auth> {
    const data = {
      grant_type: "refresh_token",
      client_id: this.options.clientId,
      refresh_token: refreshToken,
    };

    const { data: response } = await axios({
      method: "post",
      url: `https://${this.options.domain}/oauth/token`,
      data: createRequestParams(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken,
      scope: response.scope,
      tokenType: response.token_type,
    };
  }

  async logout(): Promise<void> {
    const params = {
      client_id: this.options.clientId,
      returnTo: this.options.successRedirectUri,
    };
    const queryString = createRequestParams(params);
    await open(`https://${this.options.domain}/logout?${queryString}`);
    await deleteTenantConfig();
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
          resolve(`http://localhost:${info.port}`);
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

    const { data: response } = await axios({
      method: "post",
      url: `https://${this.options.domain}/oauth/token`,
      data: createRequestParams(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
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
    const queryString = createRequestParams(params);

    return `https://${this.options.domain}/authorize?${queryString}`;
  }
}

// TODO: Need to factor this out if we look to open source this auth logic.
const getAuthOptions = async () => {
  const { data: authConfig } = await axios({
    method: "get",
    url: new url.URL("/auth/meta", prismaticUrl).toString(),
  });

  const { domain, clientId, audience } = authConfig;
  return {
    domain,
    clientId,
    audience,
    scopes: ["openid", "profile", "email", "offline_access"],
    successRedirectUri: "https://prismatic.io",
  };
};

export const login = async (props?: { url: boolean }) => {
  const authOptions = await getAuthOptions();
  const auth = new Authenticate(authOptions);
  const response = await auth.login({ url: props?.url });
  await writeConfig(response);
};

export const refresh = async (refreshToken: string) => {
  const authOptions = await getAuthOptions();
  const auth = new Authenticate(authOptions);
  const response = await auth.refresh(refreshToken);
  await writeConfig(response);
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
  const { PRISM_ACCESS_TOKEN: envAccessToken, PRISM_REFRESH_TOKEN: envRefreshToken } = process.env;

  if (envRefreshToken && !envAccessToken) {
    const { accessToken: refreshedAccessToken } = await refresh(envRefreshToken);
    return refreshedAccessToken;
  }

  const config = await readConfig();
  const { accessToken: configAccessToken, refreshToken: configRefreshToken } = config ?? {};

  const accessToken = envAccessToken ?? configAccessToken;
  const refreshToken = envRefreshToken ?? configRefreshToken;

  if (accessToken && refreshToken) {
    const now = Math.floor(new Date().getTime() / 1000);
    const { exp } = jwtDecode<{ exp: number }>(accessToken);

    // Refresh if expired or expiring in 5 minutes or less
    if (exp - now < 5 * 60) {
      const { accessToken: refreshedAccessToken } = await refresh(refreshToken);
      return refreshedAccessToken;
    }
  }

  return accessToken;
};

/**
 * Check if the user is currently logged in. Return true if so, and false otherwise.
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const configExists = await configFileExists();
  if (!configExists) {
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
export const revokeRefreshToken = async (): Promise<void> => {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new Error("You are not currently logged in.");
  }

  const config = await readConfig();
  const { refreshToken } = config ?? {};
  await axios({
    method: "post",
    url: new url.URL("/auth/revoke", prismaticUrl).toString(),
    data: {
      refresh_token: refreshToken,
    },
  });
  await deleteTenantConfig();
};

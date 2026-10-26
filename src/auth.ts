import { jwtDecode } from "jwt-decode";

import { Authenticate } from "./auth/authenticate.js";
import { withAuthOperation } from "./auth/operation.js";
import { completeTenantLogin } from "./auth/tenant-session.js";
import { getAuthOptions, revokeToken } from "./auth/transport.js";
import type { Auth } from "./auth/types.js";
import { commandSignal } from "./command.js";
import { requireCommandContext } from "./command-context.js";
import {
  type AuthContext,
  deleteAuthProfile,
  getAuthContext,
  getPrismaticUrl,
  getProfileAuthContext,
  saveProfileCredentials,
  setAuthContext,
} from "./context.js";
import { AuthenticatedUserQueryDocument as AUTHENTICATED_USER_QUERY } from "./graphql/operations/AuthenticatedUserQuery.generated.js";
import { gqlRequest } from "./graphql.js";

export { Authenticate } from "./auth/authenticate.js";
export { selectTenant } from "./auth/tenant-prompt.js";
export { fetchUserTenants } from "./auth/tenant-session.js";
export type { Tenant } from "./auth/tenants.js";
export { createRequestParams } from "./auth/transport.js";
export type { Auth, AuthenticationOptions } from "./auth/types.js";

export const login = async (props?: {
  signal?: AbortSignal;
  onChallenge?: (url: string) => void;
  nonInteractive?: boolean;
  tenantId?: string;
  url: boolean;
}) =>
  withAuthOperation(props?.signal ?? commandSignal(), async (signal) => {
    const target = await getProfileAuthContext();
    const { url: prismaticUrl } = target;
    const authOptions = await getAuthOptions(prismaticUrl, signal);
    const auth = new Authenticate(authOptions);

    const initialAuth = await auth.login({
      url: props?.url,
      signal,
      onChallenge: props?.onChallenge,
    });
    signal.throwIfAborted();
    await saveProfileCredentials(initialAuth, { replace: false });

    await completeTenantLogin(auth, { ...props, signal });
  });

const refreshAuthentication = async (
  refreshToken: string,
  tenantId?: string,
  url?: string,
  parentSignal = commandSignal(),
) =>
  withAuthOperation(parentSignal, async (signal) => {
    const authOptions = await getAuthOptions(url ?? (await getPrismaticUrl()), signal);
    return new Authenticate(authOptions).refresh(refreshToken, tenantId, signal);
  });

export const refresh = async (tenantId?: string): Promise<Auth> => {
  const target = await getProfileAuthContext();
  if (!target.profile) throw new Error(`Profile "${target.profileName}" does not exist.`);
  const response = await refreshAuthentication(target.profile.refreshToken, tenantId, target.url);
  commandSignal()?.throwIfAborted();
  await saveProfileCredentials(response);
  return response;
};

export const logout = async () => {
  const authOptions = await withAuthOperation(commandSignal(), async (signal) =>
    getAuthOptions(await getPrismaticUrl(), signal),
  );
  const auth = new Authenticate(authOptions);
  await auth.logout();
};

/**
 * Attempts to retrieve the access token for the active session. It prefers
 * the environment variables PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN first
 * but will use the config file values if those are not set. This function will
 * also refresh the access token using the provided refresh token if possible.
 */
const authenticate = async (signal = commandSignal()): Promise<AuthContext> => {
  signal?.throwIfAborted();
  const context = await getAuthContext();
  const { accessToken, refreshToken, tenantId, url } = context;
  if (!refreshToken) return context;
  let needsRefresh = true;
  if (accessToken) {
    try {
      const { exp } = jwtDecode<{ exp?: number }>(accessToken);
      needsRefresh =
        typeof exp !== "number" || !Number.isFinite(exp) || exp - Date.now() / 1000 < 300;
    } catch {
      // Opaque or malformed tokens cannot supply a reliable renewal time.
    }
  }
  if (!needsRefresh) return context;
  const refreshed = await refreshAuthentication(refreshToken, tenantId, url, signal);
  signal?.throwIfAborted();
  if (context.source === "profile") {
    await saveProfileCredentials(refreshed);
    return {
      ...context,
      ...refreshed,
      tenantId: refreshed.tenantId,
      profile: { ...refreshed, prismaticUrl: context.url },
    };
  }
  const updated = { ...context, ...refreshed, tenantId: refreshed.tenantId };
  setAuthContext(updated);
  return updated;
};

export const getAuthenticatedContext = (signal = commandSignal()): Promise<AuthContext> => {
  const command = requireCommandContext();
  if (!command.authentication) {
    command.authentication = authenticate(signal).finally(() => {
      command.authentication = undefined;
    });
  }
  return command.authentication.then((context) => {
    signal?.throwIfAborted();
    return context;
  });
};

export const getAccessToken = async (): Promise<string | undefined> =>
  (await getAuthenticatedContext()).accessToken;

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
      document: AUTHENTICATED_USER_QUERY,
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
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new Error("You are not currently logged in.");
  }

  const authContext = await getAuthContext();
  const token = authContext.refreshToken;
  if (!token) throw new Error("No refresh token is available to revoke.");
  await withAuthOperation(commandSignal(), (signal) => revokeToken(authContext.url, token, signal));
  if (authContext.source === "profile" && authContext.profileName) {
    await deleteAuthProfile();
  }
  return authContext.source;
};

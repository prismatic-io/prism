import { Authenticate } from "./auth/authenticate.js";
import { withAuthOperation } from "./auth/operation.js";
import { getAuthOptions, revokeToken } from "./auth/transport.js";
import type { Auth } from "./auth/types.js";

export { Authenticate } from "./auth/authenticate.js";
export { createRequestParams } from "./auth/transport.js";
export type { Auth, AuthenticationOptions } from "./auth/types.js";

import chalk from "chalk";
import inquirer from "inquirer";
import { jwtDecode } from "jwt-decode";
import { commandSignal, writeCommandOutput } from "./command.js";
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
import { ListUserTenantsDocument as LIST_USER_TENANTS } from "./graphql/operations/ListUserTenants.generated.js";
import { gqlRequest } from "./graphql.js";
import { whoAmI } from "./utils/user/query.js";

export interface Tenant {
  tenantId: string;
  url: string;
  orgName: string;
  awsRegion: string;
  systemSuspended: boolean | null;
}

export const fetchUserTenants = async (signal?: AbortSignal): Promise<Tenant[]> => {
  const result = await gqlRequest({
    document: LIST_USER_TENANTS,
    signal,
  });

  return result.listUserTenants.nodes;
};

export const selectTenant = async (
  tenants: Tenant[],
  options: {
    currentTenantId?: string;
    message?: string;
    signal?: AbortSignal;
  } = {},
): Promise<string | undefined> => {
  const { currentTenantId, message = "Select a tenant:", signal } = options;
  signal?.throwIfAborted();

  const currentTenant = tenants.find((t) => t.tenantId === currentTenantId);
  const currentTenantSuspended = currentTenant?.systemSuspended ?? false;

  const activeTenants = tenants.filter((t) => !t.systemSuspended);
  if (activeTenants.length === 0) {
    writeCommandOutput(
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
    const prompt = signal ? inquirer.createPromptModule({ signal }) : inquirer.prompt;
    const { tenantId } = await prompt<{ tenantId: string }>([
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
    signal?.throwIfAborted();
    // User cancelled tenant selection
    return;
  }
};

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

    const tenants = await fetchUserTenants(signal);

    const user = await whoAmI(signal);
    signal.throwIfAborted();
    // Follow-up API calls may have refreshed and rotated the initial credentials.
    const sessionProfile = (await getProfileAuthContext()).profile;
    if (!sessionProfile) throw new Error("Authentication profile is no longer available.");
    const { prismaticUrl: _prismaticUrl, ...sessionAuth } = sessionProfile;
    signal.throwIfAborted();
    const initialTenantId = user.tenantId;
    const initialTenant = tenants.find((t) => t.tenantId === initialTenantId);
    const initialTenantSuspended = initialTenant?.systemSuspended ?? false;

    if (!initialTenantSuspended && initialTenantId) {
      await saveProfileCredentials({ ...sessionAuth, tenantId: initialTenantId });
    }

    const activeTenants = tenants.filter((t) => !t.systemSuspended);
    const requestedTenant = props?.tenantId
      ? activeTenants.find((tenant) => tenant.tenantId === props.tenantId)
      : undefined;
    if (props?.tenantId && !requestedTenant) {
      throw new Error(`Tenant '${props.tenantId}' is not available to this profile.`);
    }
    if (!initialTenantSuspended && activeTenants.length <= 1) {
      return;
    }
    if (props?.nonInteractive && !requestedTenant) {
      throw new Error(
        `Multiple tenants are available. Re-run with --tenant-id (${activeTenants
          .map((tenant) => tenant.tenantId)
          .join(", ")}).`,
      );
    }
    const selectedTenantId =
      requestedTenant?.tenantId ??
      (await selectTenant(tenants, {
        currentTenantId: initialTenantId,
        signal,
      }));

    if (selectedTenantId) {
      const tenantAuth = await auth.refresh(sessionAuth.refreshToken, selectedTenantId, signal);
      signal.throwIfAborted();
      await saveProfileCredentials(tenantAuth);
    } else if (initialTenantSuspended) {
      signal.throwIfAborted();
      await deleteAuthProfile();
    }

    return;
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

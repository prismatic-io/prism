import { deleteAuthProfile, getProfileAuthContext, saveProfileCredentials } from "../context.js";
import { ListUserTenantsDocument as LIST_USER_TENANTS } from "../graphql/operations/ListUserTenants.generated.js";
import { gqlRequest } from "../graphql.js";
import { whoAmI } from "../utils/user/query.js";
import type { Authenticate } from "./authenticate.js";
import { selectTenant } from "./tenant-prompt.js";
import {
  planTenantLogin,
  type Tenant,
  type TenantAccess,
  type TenantSelectionOptions,
  tenantAccess,
} from "./tenants.js";

export const fetchUserTenants = async (signal?: AbortSignal): Promise<Tenant[]> => {
  const result = await gqlRequest({ document: LIST_USER_TENANTS, signal });
  return result.listUserTenants.nodes;
};

const currentCredentials = async (signal: AbortSignal) => {
  // Authenticated queries may rotate credentials. Read them at the point of use.
  const { profile } = await getProfileAuthContext();
  signal.throwIfAborted();
  if (!profile) throw new Error("Authentication profile is no longer available.");
  const { prismaticUrl: _url, ...credentials } = profile;
  return credentials;
};

const rememberCurrentTenant = async (access: TenantAccess, signal: AbortSignal) => {
  if (access.currentSuspended || !access.currentTenantId) return;
  const credentials = await currentCredentials(signal);
  await saveProfileCredentials({ ...credentials, tenantId: access.currentTenantId });
};

const applyLoginSelection = async (
  auth: Authenticate,
  access: TenantAccess,
  selectedTenantId: string | undefined,
  signal: AbortSignal,
) => {
  signal.throwIfAborted();
  if (selectedTenantId) {
    const credentials = await currentCredentials(signal);
    const selected = await auth.refresh(credentials.refreshToken, selectedTenantId, signal);
    signal.throwIfAborted();
    await saveProfileCredentials(selected);
  } else if (access.currentSuspended) {
    await deleteAuthProfile();
  }
};

/** Discover membership, choose a tenant, then apply only the resulting credential change. */
export const completeTenantLogin = async (
  auth: Authenticate,
  options: TenantSelectionOptions & { signal: AbortSignal },
): Promise<void> => {
  const { signal } = options;
  const tenants = await fetchUserTenants(signal);
  const user = await whoAmI(signal);
  signal.throwIfAborted();
  const access = tenantAccess(tenants, user.tenantId);
  await rememberCurrentTenant(access, signal);

  const selection = planTenantLogin(access, options);
  if (selection.kind === "keep") return;
  const tenantId =
    selection.kind === "select"
      ? selection.tenantId
      : await selectTenant(tenants, { currentTenantId: user.tenantId, signal });
  await applyLoginSelection(auth, access, tenantId, signal);
};

export interface Tenant {
  tenantId: string;
  url: string;
  orgName: string;
  awsRegion: string;
  systemSuspended: boolean | null;
}

/** Membership facts shared by login, switching, and the interactive prompt. */
export const tenantAccess = (tenants: Tenant[], currentTenantId?: string) => {
  const current = tenants.find((tenant) => tenant.tenantId === currentTenantId);
  return {
    tenants,
    currentTenantId,
    current,
    currentSuspended: current?.systemSuspended ?? false,
    active: tenants.filter((tenant) => !tenant.systemSuspended),
  };
};
export type TenantAccess = ReturnType<typeof tenantAccess>;
export type TenantSelection =
  | { kind: "keep" }
  | { kind: "select"; tenantId: string }
  | { kind: "prompt" };
export interface TenantSelectionOptions {
  tenantId?: string;
  nonInteractive?: boolean;
}

const requestedTenant = (access: TenantAccess, tenantId?: string): Tenant | undefined => {
  if (tenantId === undefined) return;
  const tenant = access.active.find((tenant) => tenant.tenantId === tenantId);
  if (!tenant) throw new Error(`Tenant '${tenantId}' is not available to this profile.`);
  return tenant;
};

/** Login can retain its default tenant; suspended defaults require a selection. */
export const planTenantLogin = (
  access: TenantAccess,
  options: TenantSelectionOptions,
): TenantSelection => {
  const requested = requestedTenant(access, options.tenantId);
  if (!access.currentSuspended && access.active.length <= 1) return { kind: "keep" };
  if (requested) return { kind: "select", tenantId: requested.tenantId };
  if (options.nonInteractive) {
    throw new Error(
      `Multiple tenants are available. Re-run with --tenant-id (${access.active.map((tenant) => tenant.tenantId).join(", ")}).`,
    );
  }
  return { kind: "prompt" };
};

/** An explicit switch must honor a different tenant even when it is the only active one. */
export const planTenantSwitch = (
  access: TenantAccess,
  options: TenantSelectionOptions,
): TenantSelection => {
  const requested = requestedTenant(access, options.tenantId);
  if (
    !access.currentSuspended &&
    access.active.length <= 1 &&
    (!requested || requested.tenantId === access.currentTenantId)
  )
    return { kind: "keep" };
  if (requested) return { kind: "select", tenantId: requested.tenantId };
  if (options.nonInteractive) {
    throw new Error("Agent mode requires --tenant-id when more than one tenant is available.");
  }
  return { kind: "prompt" };
};

import { Cli, z } from "incur";
import {
  planTenantSwitch,
  type TenantAccess,
  type TenantSelection,
  tenantAccess,
} from "../../auth/tenants.js";
import {
  fetchUserTenants,
  getAuthenticatedContext,
  isLoggedIn,
  refresh,
  selectTenant,
} from "../../auth.js";
import { commandSignal, writeCommandStatus } from "../../command.js";
import { getProfileAuthContext, saveProfileCredentials } from "../../context.js";
import { ValidationError } from "../../errors.js";
import { whoAmI } from "../../utils/user/query.js";

export default Cli.command({
  output: z.object({
    profile: z.string(),
    tenantId: z.string().optional(),
    switched: z.boolean(),
    authenticated: z.boolean(),
  }),
  description: "Switch between organization tenants",
  options: z.object({
    "tenant-id": z.string().optional().describe("Tenant ID to select without prompting"),
  }),
  async run(context) {
    const {
      options: { "tenant-id": tenantId },
    } = context;
    await getAuthenticatedContext();
    const { profileName, profile: config } = await getProfileAuthContext();
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      writeCommandStatus("Not logged in. Run 'prism login'.");
      return context.ok(
        { profile: profileName, switched: false, authenticated: false },
        {
          cta: {
            commands: [
              {
                command: "login",
                description: "Authenticate this profile",
                options: { profile: profileName },
              },
            ],
          },
        },
      );
    }

    const tenants = await fetchUserTenants();

    let currentTenantId = config.tenantId;
    if (!currentTenantId) {
      const user = await whoAmI();
      currentTenantId = user.tenantId;
    }

    const access = tenantAccess(tenants, currentTenantId);
    let selection: TenantSelection;
    try {
      selection = planTenantSwitch(access, { tenantId, nonInteractive: context.agent });
    } catch (error) {
      return context.error(
        new ValidationError({
          retryable: false,
          message: (error as Error).message,
        }).toResult(),
      );
    }
    if (selection.kind === "keep") {
      writeCommandStatus(
        access.active.length === 1
          ? "This is the only tenant available to this profile."
          : "No tenants are available to this profile.",
      );
      return {
        profile: profileName,
        tenantId: currentTenantId,
        switched: false,
        authenticated: true,
      };
    }

    if (!access.currentSuspended && access.current) {
      writeCommandStatus(`Current tenant: ${access.current.orgName} (${access.current.url})\n`);
    }

    const selectedTenantId =
      selection.kind === "select"
        ? selection.tenantId
        : await selectTenant(tenants, {
            currentTenantId,
            message: "Select a tenant to switch to:",
            signal: commandSignal(),
          });
    return {
      profile: profileName,
      authenticated: true,
      ...(await applyTenantSwitch(access, selectedTenantId)),
    };
  },
});

/** Keep the active session on cancellation, or renew it for the selected tenant. */
const applyTenantSwitch = async (access: TenantAccess, selectedTenantId?: string) => {
  const { currentTenantId, current, currentSuspended } = access;
  if (!selectedTenantId || selectedTenantId === currentTenantId) {
    if (currentTenantId && !currentSuspended) {
      const { profile } = await getProfileAuthContext();
      commandSignal()?.throwIfAborted();
      if (!profile) throw new Error("Authentication profile is no longer available.");
      await saveProfileCredentials({ ...profile, tenantId: currentTenantId });
      writeCommandStatus(`Active tenant: ${current?.orgName} (${current?.url})`);
    }
    return { tenantId: currentTenantId, switched: false };
  }
  writeCommandStatus("\nSwitching tenant...");
  await refresh(selectedTenantId);
  const selected = access.active.find((tenant) => tenant.tenantId === selectedTenantId);
  writeCommandStatus(`Switched to: ${selected?.orgName} (${selected?.url})`);
  return { tenantId: selectedTenantId, switched: true };
};

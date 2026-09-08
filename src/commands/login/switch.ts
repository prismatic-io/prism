import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { fetchUserTenants, isLoggedIn, refresh, selectTenant } from "../../auth.js";
import { getActiveProfileName, readProfile, writeActiveProfile } from "../../config.js";
import { whoAmI } from "../../utils/user/query.js";
import { z } from "incur";

export default defineCommand({
  output: z.object({
    profile: z.string(),
    tenantId: z.string().optional(),
    switched: z.boolean(),
    authenticated: z.boolean(),
  }),
  mutates: true,
  description: "Switch between organization tenants",
  authContext: "profile" as const,
  options: optionsSchema(
    z.object({
      "tenant-id": z.string().optional().describe("Tenant ID to select without prompting"),
    }),
  ),
  async run(context) {
    const {
      options: { "tenant-id": tenantId },
    } = context;
    const profileName = context.globals.profile ?? (await getActiveProfileName());
    const config = await readProfile(profileName);
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      commandOutput.log("Not logged in. Run 'prism login'.");
      return { profile: profileName, switched: false, authenticated: false };
    }

    const tenants = await fetchUserTenants();

    let currentTenantId = config.tenantId;
    if (!currentTenantId) {
      const user = await whoAmI();
      currentTenantId = user.tenantId;
    }

    const currentTenant = tenants.find((t) => t.tenantId === currentTenantId);
    const currentTenantSuspended = currentTenant?.systemSuspended ?? false;
    const activeTenants = tenants.filter((t) => !t.systemSuspended);

    if (!currentTenantSuspended && activeTenants.length <= 1) {
      const message =
        activeTenants.length === 1
          ? "This is the only tenant available to this profile."
          : "No tenants are available to this profile.";
      commandOutput.log(message);
      return {
        profile: profileName,
        tenantId: currentTenantId,
        switched: false,
        authenticated: true,
      };
    }

    if (!currentTenantSuspended && currentTenant) {
      commandOutput.log(`Current tenant: ${currentTenant.orgName} (${currentTenant.url})\n`);
    }

    const requestedTenant = tenantId
      ? activeTenants.find((tenant) => tenant.tenantId === tenantId)
      : undefined;
    if (tenantId && !requestedTenant) {
      commandOutput.error(`Tenant '${tenantId}' is not available to this profile.`, { exit: 2 });
    }
    if (context.agent && !requestedTenant) {
      commandOutput.error(
        "Agent mode requires --tenant-id when more than one tenant is available.",
        {
          exit: 2,
        },
      );
    }
    const selectedTenantId =
      requestedTenant?.tenantId ??
      (await selectTenant(tenants, {
        currentTenantId,
        message: "Select a tenant to switch to:",
      }));

    if (!selectedTenantId || selectedTenantId === currentTenantId) {
      if (currentTenantId && !currentTenantSuspended) {
        await writeActiveProfile(
          {
            ...config,
            tenantId: currentTenantId,
          },
          profileName,
        );
        commandOutput.log(`Active tenant: ${currentTenant?.orgName} (${currentTenant?.url})`);
      }
      return {
        profile: profileName,
        tenantId: currentTenantId,
        switched: false,
        authenticated: true,
      };
    }

    commandOutput.log("\nSwitching tenant...");
    await refresh(config.refreshToken, selectedTenantId, profileName);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    commandOutput.log(`Switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
    return {
      profile: profileName,
      tenantId: selectedTenantId,
      switched: true,
      authenticated: true,
    };
  },
});

import { commandOutput, defineCommand, type CommandContext } from "../../command.js";
import { fetchUserTenants, isLoggedIn, refresh, selectTenant } from "../../auth.js";
import { getActiveProfileName, readProfile, writeActiveProfile } from "../../config.js";
import { whoAmI } from "../../utils/user/query.js";

export default defineCommand({
  description: "Switch between organization tenants",
  authContext: "profile" as const,
  async run(context: CommandContext) {
    const profileName = context.globals.profile ?? (await getActiveProfileName());
    const config = await readProfile(profileName);
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      commandOutput.log("Not logged in. Run 'prism login'.");
      return;
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
      return;
    }

    if (!currentTenantSuspended && currentTenant) {
      commandOutput.log(`Current tenant: ${currentTenant.orgName} (${currentTenant.url})\n`);
    }

    const selectedTenantId = await selectTenant(tenants, {
      currentTenantId,
      message: "Select a tenant to switch to:",
    });

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
      return;
    }

    commandOutput.log("\nSwitching tenant...");
    await refresh(config.refreshToken, selectedTenantId, profileName);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    commandOutput.log(`Switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
  },
});

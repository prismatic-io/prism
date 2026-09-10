import {
  fetchUserTenants,
  getAuthenticatedContext,
  isLoggedIn,
  refresh,
  selectTenant,
} from "../../auth.js";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { resolveProfileAuthContext } from "../../context.js";
import { whoAmI } from "../../utils/user/query.js";

export default class LoginSwitchCommand extends PrismaticBaseCommand {
  static description = "Switch between organization tenants";

  protected authContext = "profile" as const;

  async run() {
    await this.parse(LoginSwitchCommand);
    const target = await getAuthenticatedContext(await resolveProfileAuthContext(this.profileName));
    const { profileName, profile: config } = target;
    const loggedIn = (await isLoggedIn(target)) && config;
    if (!loggedIn) {
      this.log("Not logged in. Run 'prism login'.");
      return;
    }

    const tenants = await fetchUserTenants(target);

    let currentTenantId = config.tenantId;
    if (!currentTenantId) {
      const user = await whoAmI(target);
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
      this.log(message);
      return;
    }

    if (!currentTenantSuspended && currentTenant) {
      this.log(`Current tenant: ${currentTenant.orgName} (${currentTenant.url})\n`);
    }

    const selectedTenantId = await selectTenant(tenants, {
      currentTenantId,
      message: "Select a tenant to switch to:",
    });

    if (!selectedTenantId || selectedTenantId === currentTenantId) {
      if (currentTenantId && !currentTenantSuspended) {
        const replaced = await target.store.replaceCredentials(profileName, config, {
          ...config,
          tenantId: currentTenantId,
        });
        if (!replaced)
          throw new Error(
            `Profile "${profileName}" changed while switching tenants. Retry the command.`,
          );
        this.log(`Active tenant: ${currentTenant?.orgName} (${currentTenant?.url})`);
      }
      return;
    }

    this.log("\nSwitching tenant...");
    await refresh(target, selectedTenantId);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    this.log(`Switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
  }
}

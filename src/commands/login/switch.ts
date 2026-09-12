import {
  fetchUserTenants,
  getAuthenticatedContext,
  isLoggedIn,
  refresh,
  selectTenant,
} from "../../auth.js";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { getProfileAuthContext, saveProfileCredentials } from "../../context.js";
import { whoAmI } from "../../utils/user/query.js";

export default class LoginSwitchCommand extends PrismaticBaseCommand {
  static description = "Switch between organization tenants";

  protected authContext = "profile" as const;

  async run() {
    await this.parse(LoginSwitchCommand);
    await getAuthenticatedContext();
    const { profile: config } = await getProfileAuthContext();
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      this.log("Not logged in. Run 'prism login'.");
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
        await saveProfileCredentials({ ...config, tenantId: currentTenantId });
        this.log(`Active tenant: ${currentTenant?.orgName} (${currentTenant?.url})`);
      }
      return;
    }

    this.log("\nSwitching tenant...");
    await refresh(selectedTenantId);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    this.log(`Switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
  }
}

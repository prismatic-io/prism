import { Command } from "@oclif/core";
import { fetchUserTenants, isLoggedIn, refresh, selectTenant } from "../../auth.js";
import { readConfig, writeConfig } from "../../config.js";
import { whoAmI } from "../../utils/user/query.js";

export default class LoginSwitchCommand extends Command {
  static description = "Switch between organization tenants";

  async run() {
    await this.parse(LoginSwitchCommand);
    const config = await readConfig();
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      this.log("You are not logged in. Please run 'prism login' first.");
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
      const log_msg =
        activeTenants.length === 1
          ? "You are currently authenticated with the only tenant available on this stack. To switch to a tenant on another stack, update the PRISMATIC_URL value to access additional tenants."
          : "Your user does not have access to tenants on this stack. Check the PRISMATIC_URL value.";
      this.log(log_msg);
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
        await writeConfig({
          ...config,
          tenantId: currentTenantId,
        });
        this.log(`Active tenant: ${currentTenant?.orgName} (${currentTenant?.url})`);
      }
      return;
    }

    this.log("\nSwitching tenant...");
    await refresh(config.refreshToken, selectedTenantId);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    this.log(`Successfully switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
  }
}

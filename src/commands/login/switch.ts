import { Command } from "@oclif/core";
import { isLoggedIn, refresh, fetchUserTenants, selectTenant } from "../../auth.js";
import { readConfig, writeConfig } from "../../config.js";
import { whoAmI } from "../../utils/user/query.js";

export default class LoginSwitchCommand extends Command {
  static description = "Switch between organization tenants";

  async run() {
    // Check if user is logged in
    const config = await readConfig();
    const loggedIn = (await isLoggedIn()) && config;
    if (!loggedIn) {
      this.log("You are not logged in. Please run 'prism login' first.");
      return;
    }

    const tenants = await fetchUserTenants();

    if (tenants.length <= 1) {
      this.log("Your account is not yet configured for multi-tenant access.");
      return;
    }

    // Get current tenant ID - either from config or from API
    let currentTenantId = config.tenantId;
    if (!currentTenantId) {
      const user = await whoAmI();
      currentTenantId = user.tenantId;
    }

    const currentTenant = tenants.find((t) => t.tenantId === currentTenantId);
    if (currentTenant) {
      this.log(`Current tenant: ${currentTenant.orgName} (${currentTenant.url})\n`);
    }

    const selectedTenantId = await selectTenant(tenants, {
      currentTenantId,
      message: "Select a tenant to switch to:",
    });

    if (!selectedTenantId || selectedTenantId === currentTenantId) {
      if (currentTenantId) {
        await writeConfig({
          ...config,
          tenantId: currentTenantId,
        });
        const selectedTenant = tenants.find((t) => t.tenantId === currentTenantId);
        this.log(`Active tenant: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
      }
      return;
    }

    this.log("\nSwitching tenant...");
    await refresh(config.refreshToken, selectedTenantId);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    this.log(`Successfully switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
  }
}

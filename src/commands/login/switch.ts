import { Cli, z } from "incur";
import {
  fetchUserTenants,
  getAuthenticatedContext,
  isLoggedIn,
  refresh,
  selectTenant,
} from "../../auth.js";
import { commandGlobals, writeCommandStatus } from "../../command.js";
import { resolveProfileAuthContext } from "../../context.js";
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
    const target = await getAuthenticatedContext(
      await resolveProfileAuthContext(commandGlobals().profile),
    );
    const { profileName, profile: config } = target;
    const loggedIn = (await isLoggedIn(target)) && config;
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
      writeCommandStatus(message);
      return {
        profile: profileName,
        tenantId: currentTenantId,
        switched: false,
        authenticated: true,
      };
    }

    if (!currentTenantSuspended && currentTenant) {
      writeCommandStatus(`Current tenant: ${currentTenant.orgName} (${currentTenant.url})\n`);
    }

    const requestedTenant = tenantId
      ? activeTenants.find((tenant) => tenant.tenantId === tenantId)
      : undefined;
    if (tenantId && !requestedTenant) {
      return context.error({
        code: "VALIDATION_ERROR",
        retryable: false,
        message: `Tenant '${tenantId}' is not available to this profile.`,
        exitCode: 2,
      });
    }
    if (context.agent && !requestedTenant) {
      return context.error({
        code: "VALIDATION_ERROR",
        retryable: false,
        message: "Agent mode requires --tenant-id when more than one tenant is available.",
        exitCode: 2,
      });
    }
    const selectedTenantId =
      requestedTenant?.tenantId ??
      (await selectTenant(tenants, {
        currentTenantId,
        message: "Select a tenant to switch to:",
      }));

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
        writeCommandStatus(`Active tenant: ${currentTenant?.orgName} (${currentTenant?.url})`);
      }
      return {
        profile: profileName,
        tenantId: currentTenantId,
        switched: false,
        authenticated: true,
      };
    }

    writeCommandStatus("\nSwitching tenant...");
    await refresh(target, selectedTenantId);

    const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);
    writeCommandStatus(`Switched to: ${selectedTenant?.orgName} (${selectedTenant?.url})`);
    return {
      profile: profileName,
      tenantId: selectedTenantId,
      switched: true,
      authenticated: true,
    };
  },
});

import chalk from "chalk";
import inquirer from "inquirer";
import { writeCommandOutput } from "../command.js";
import { type Tenant, tenantAccess } from "./tenants.js";

export const selectTenant = async (
  tenants: Tenant[],
  options: {
    currentTenantId?: string;
    message?: string;
    signal?: AbortSignal;
  } = {},
): Promise<string | undefined> => {
  const { currentTenantId, message = "Select a tenant:", signal } = options;
  signal?.throwIfAborted();

  const { active: activeTenants, currentSuspended } = tenantAccess(tenants, currentTenantId);
  if (activeTenants.length === 0) {
    writeCommandOutput(
      chalk.red(
        "You have no active tenants on this stack. Please contact Prismatic support for assistance.",
      ),
    );
    return;
  }

  const effectiveCurrentId = currentSuspended ? undefined : currentTenantId;

  const choices = activeTenants.map((tenant) => {
    const isCurrent = tenant.tenantId === effectiveCurrentId;
    const checkmark = isCurrent ? chalk.green("✓ ") : "  ";
    const label = `${tenant.orgName} - ${tenant.url} (${tenant.awsRegion})`;
    const displayName = isCurrent ? chalk.green(label) : label;

    return {
      name: `${checkmark}${displayName}`,
      value: tenant.tenantId,
      short: tenant.orgName,
    };
  });

  try {
    const prompt = signal ? inquirer.createPromptModule({ signal }) : inquirer.prompt;
    const { tenantId } = await prompt<{ tenantId: string }>([
      {
        type: "select",
        name: "tenantId",
        message,
        choices,
        default: effectiveCurrentId,
      },
    ]);

    return tenantId;
    // biome-ignore lint/correctness/noUnusedVariables: TODO
  } catch (error) {
    signal?.throwIfAborted();
    // User cancelled tenant selection
    return;
  }
};

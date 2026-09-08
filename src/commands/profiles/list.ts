import { tableOutputSchema } from "../../utils/table.js";
import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { listProfiles } from "../../config.js";
import { ux } from "../../utils/ux.js";
import { z } from "incur";

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["name", "prismaticUrl", "tenantId", "isDefault"]),
  description: "List profiles",
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
    }),
  ),
  async run(context) {
    const { options: flags } = context;

    const profiles = await listProfiles();
    if (profiles.length === 0) {
      if (context.agent) return { items: [] };
      commandOutput.log("No profiles found.");
      return { items: [] };
    }

    return ux.table(
      profiles,
      {
        name: {
          header: "Profile",
          get: (p) => (!context.agent && p.isDefault ? `${p.name} (default)` : p.name),
        },
        prismaticUrl: { header: "Endpoint URL" },
        ...(context.agent ? { isDefault: {} } : {}),
        tenantId: { header: "Tenant ID", get: (p) => p.tenantId ?? "" },
      },
      flags,
    );
  },
});

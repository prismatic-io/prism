import { Cli, z } from "incur";
import { writeCommandStatus } from "../../command.js";
import { getConfigStore } from "../../context.js";
import { printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["name", "prismaticUrl", "tenantId", "isDefault"]),
  description: "List profiles",
  options: z.object({
    ...tableFlags(),
  }),
  async run(context) {
    const { options: flags } = context;

    const profiles = await getConfigStore().listProfiles();
    if (profiles.length === 0) {
      if (context.agent) return { items: [] };
      writeCommandStatus("No profiles found.");
      return { items: [] };
    }

    return printTable(
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

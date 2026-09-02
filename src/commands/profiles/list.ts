import { commandInput, commandOutput, defineCommand, type CommandContext } from "../../command.js";
import { listProfiles } from "../../config.js";
import { ux } from "../../utils/ux.js";

export default defineCommand({
  description: "List profiles",
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    const profiles = await listProfiles();
    if (profiles.length === 0) {
      commandOutput.log("No profiles found.");
      return;
    }

    return ux.table(
      profiles,
      {
        name: { header: "Profile", get: (p) => (p.isDefault ? `${p.name} (default)` : p.name) },
        prismaticUrl: { header: "Endpoint URL" },
        tenantId: { header: "Tenant ID", get: (p) => p.tenantId ?? "" },
      },
      flags,
    );
  },
});

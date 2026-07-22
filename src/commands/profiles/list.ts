import { PrismaticBaseCommand } from "../../baseCommand.js";
import { listProfiles } from "../../config.js";
import { ux } from "../../utils/ux.js";

export default class ProfilesListCommand extends PrismaticBaseCommand {
  static description = "List profiles";

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ProfilesListCommand);

    const profiles = await listProfiles();
    if (profiles.length === 0) {
      this.log("No profiles found.");
      return;
    }

    ux.table(
      profiles,
      {
        name: { header: "Profile", get: (p) => (p.isDefault ? `${p.name} (default)` : p.name) },
        prismaticUrl: { header: "Endpoint URL" },
        tenantId: { header: "Tenant ID", get: (p) => p.tenantId ?? "" },
      },
      flags,
    );
  }
}

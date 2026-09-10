import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { getConfigStore } from "../../context.js";

export default class ProfilesDeleteCommand extends PrismaticBaseCommand {
  static description = "Delete a profile";

  static args = {
    name: Args.string({
      required: true,
      description: "Profile to delete",
    }),
  };

  async run() {
    const {
      args: { name },
    } = await this.parse(ProfilesDeleteCommand);

    const result = await getConfigStore().deleteProfile(name);
    if (!result.deleted) {
      this.error(`Profile '${name}' does not exist.`, { exit: 1 });
    }

    if (result.isLast) {
      this.log(`Deleted '${name}'. No profiles remain.`);
      return;
    }

    this.log(`Deleted '${name}'.`);
    if (result.defaultChanged) {
      this.log(`Default profile is now '${result.defaultProfile}'.`);
    }
  }
}

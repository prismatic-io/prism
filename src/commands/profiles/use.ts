import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { useProfile } from "../../config.js";

export default class ProfilesUseCommand extends PrismaticBaseCommand {
  static description = "Set the default profile";

  static args = {
    name: Args.string({
      required: true,
      description: "Profile to use by default",
    }),
  };

  async run() {
    const {
      args: { name },
    } = await this.parse(ProfilesUseCommand);

    await useProfile(name);
    this.log(`Using '${name}' by default.`);
  }
}

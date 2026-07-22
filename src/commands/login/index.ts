import { Flags } from "@oclif/core";
import { isLoggedIn, login } from "../../auth.js";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { getActiveProfileName } from "../../config.js";
import { ux } from "../../utils/ux.js";

export default class LoginCommand extends PrismaticBaseCommand {
  static description = "Log in to your Prismatic account";

  static flags = {
    force: Flags.boolean({
      char: "f",
      default: false,
      description: "re-authenticate, even if you are already logged in",
    }),
    url: Flags.boolean({
      char: "u",
      default: false,
      description: "returns a challenge url without automatically opening a browser",
    }),
  };

  protected authContext = "profile" as const;

  async run() {
    const {
      flags: { force, url },
    } = await this.parse(LoginCommand);

    const profileName = await getActiveProfileName();

    if (!force && (await isLoggedIn())) {
      this.log(`Already logged in to '${profileName}'.`);
      return;
    }

    if (!url) {
      await ux.anykey("Press any key to open prismatic.io in your default browser");
    }

    await login({ url, profileName });
    this.log(`Logged in to '${profileName}'.`);
  }
}

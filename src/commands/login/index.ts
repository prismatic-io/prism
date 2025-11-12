import { Command, Flags, ux } from "@oclif/core";
import { isLoggedIn, login } from "../../auth.js";

export default class LoginCommand extends Command {
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

  async run() {
    const {
      flags: { force, url },
    } = await this.parse(LoginCommand);

    if (!force && (await isLoggedIn())) {
      this.log("You are already logged in and ready to go!");
      return;
    }

    if (!url) {
      await ux.anykey("Press any key to open prismatic.io in your default browser");
    }

    await login({ url });
    this.log("Login complete!");
  }
}

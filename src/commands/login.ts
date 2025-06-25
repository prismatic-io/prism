import { Command, Flags, ux } from "@oclif/core";
import inquirer from "inquirer";
import { isLoggedIn, login } from "../auth.js";
import { hasLegacyConfig } from "../config.js";

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

    if (await hasLegacyConfig()) {
      const currentTenant = process.env.PRISMATIC_URL ?? "https://app.prismatic.io";

      this.log("⚠️  Existing credentials detected in legacy format.");
      this.log(`You are logging in to: ${currentTenant}`);
      this.log("");
      this.log("We'll migrate your existing credentials to the new multi-tenant format.");
      this.log("Your existing credentials will be preserved under the current tenant URL.");
      this.log("");

      const { shouldProceed } = await inquirer.prompt({
        type: "confirm",
        name: "shouldProceed",
        message: "Migrate to multi-tenant format and add new credentials?",
        default: true,
      });

      if (!shouldProceed) {
        this.log("Login cancelled. Your existing credentials remain unchanged.");
        return;
      }

      this.log("");
    }

    if (!url) {
      await ux.anykey("Press any key to open prismatic.io in your default browser");
    }

    await login({ url });

    this.log("Login complete!");
  }
}

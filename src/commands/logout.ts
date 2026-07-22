import { Flags } from "@oclif/core";
import { logout } from "../auth.js";
import { PrismaticBaseCommand } from "../baseCommand.js";
import { deleteProfile, getActiveProfileName } from "../config.js";
import { hasEnvironmentCredentials } from "../context.js";

export default class LogoutCommand extends PrismaticBaseCommand {
  static description = "Log out of your Prismatic account";
  static flags = {
    browser: Flags.boolean({
      char: "b",
      description: "additionally log out of your default browser's session",
    }),
  };

  protected authContext = "profile" as const;

  async run() {
    const {
      flags: { browser },
    } = await this.parse(LogoutCommand);

    const profileName = await getActiveProfileName();
    const environmentCredentialsActive = hasEnvironmentCredentials();

    if (browser) {
      await logout();
    }

    const result = await deleteProfile(profileName);
    if (!result.deleted) {
      const environmentHint = environmentCredentialsActive
        ? " Environment credentials remain active until you unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN."
        : "";
      this.error(`Profile '${profileName}' does not exist.${environmentHint}`, { exit: 1 });
    }
    this.log(`Logged out of '${profileName}'.`);
    if (environmentCredentialsActive) {
      this.warn(
        "Environment credentials are still active. Unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN to stop using them.",
      );
    }
  }
}

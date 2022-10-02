import { Command, Flags } from "@oclif/core";
import { deleteConfig } from "../config";
import { logout } from "../auth";

export default class LogoutCommand extends Command {
  static description = "Log out of your Prismatic account";
  static flags = {
    browser: Flags.boolean({
      char: "b",
      description: "additionally log out of your default browser's session",
    }),
  };

  async run() {
    const {
      flags: { browser },
    } = await this.parse(LogoutCommand);

    if (browser) {
      await logout();
    }

    await deleteConfig();
    this.log("Logout complete!");
  }
}

import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../command.js";
import { logout } from "../auth.js";
import { deleteProfile, getActiveProfileName } from "../config.js";
import { hasEnvironmentCredentials } from "../context.js";

export default defineCommand({
  description: "Log out of your Prismatic account",
  options: {
    browser: option.boolean({
      char: "b",
      description: "additionally log out of your default browser's session",
    }),
  },
  authContext: "profile" as const,
  async run(_context: CommandContext) {
    const {
      flags: { browser },
    } = commandInput();

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
      commandOutput.error(`Profile '${profileName}' does not exist.${environmentHint}`, {
        exit: 1,
      });
    }
    commandOutput.log(`Logged out of '${profileName}'.`);
    if (environmentCredentialsActive) {
      commandOutput.warn(
        "Environment credentials are still active. Unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN to stop using them.",
      );
    }
  },
});

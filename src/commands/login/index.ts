import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { isLoggedIn, login } from "../../auth.js";
import { getActiveProfileName } from "../../config.js";
import { ux } from "../../utils/ux.js";

export default defineCommand({
  description: "Log in to your Prismatic account",
  options: {
    force: option.boolean({
      char: "f",
      default: false,
      description: "re-authenticate, even if you are already logged in",
    }),
    url: option.boolean({
      char: "u",
      default: false,
      description: "returns a challenge url without automatically opening a browser",
    }),
  },
  authContext: "profile" as const,
  async run(_context: CommandContext) {
    const {
      flags: { force, url },
    } = commandInput();

    const profileName = await getActiveProfileName();

    if (!force && (await isLoggedIn())) {
      commandOutput.log(`Already logged in to '${profileName}'.`);
      return;
    }

    if (!url) {
      await ux.anykey("Press any key to open prismatic.io in your default browser");
    }

    await login({ url, profileName });
    commandOutput.log(`Logged in to '${profileName}'.`);
  },
});

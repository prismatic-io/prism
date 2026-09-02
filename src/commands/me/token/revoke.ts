import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { revokeRefreshToken } from "../../../auth.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  description: "Revoke all refresh tokens for your user",
  options: {
    confirm: option.boolean({
      allowNo: true,
      default: true,
      description: "Prompt for confirmation before revoking tokens. Use --no-confirm to skip.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { confirm },
    } = commandInput();

    if (confirm) {
      const shouldContinue = await ux.confirm(
        "This will revoke all refresh tokens for the current user. Continue? (yes/no)",
      );
      if (!shouldContinue) {
        commandOutput.error("Operation canceled", { exit: 1 });
      }
    }

    const source = await revokeRefreshToken();
    commandOutput.log("All refresh tokens for your user have been revoked.");
    if (source === "environment") {
      commandOutput.warn(
        "Remove PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN from your environment before running more commands.",
      );
    }
  },
});

import { Flags } from "@oclif/core";
import { revokeRefreshToken } from "../../../auth.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { ux } from "../../../utils/ux.js";

export default class RevokeTokenCommand extends PrismaticBaseCommand {
  static description = "Revoke all refresh tokens for your user";

  static flags = {
    confirm: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Prompt for confirmation before revoking tokens. Use --no-confirm to skip.",
    }),
  };

  async run() {
    const {
      flags: { confirm },
    } = await this.parse(RevokeTokenCommand);

    if (confirm) {
      const shouldContinue = await ux.confirm(
        "This will revoke all refresh tokens for the current user. Continue? (yes/no)",
      );
      if (!shouldContinue) {
        this.error("Operation canceled", { exit: 1 });
      }
    }

    await revokeRefreshToken();
    this.log("All refresh tokens for your user have been revoked.");
  }
}

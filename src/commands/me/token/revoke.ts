import { Command } from "@oclif/core";
import { revokeRefreshToken } from "../../../auth.js";

export default class RevokeTokenCommand extends Command {
  static description = "Revoke all refresh tokens for your user";

  async run() {
    await revokeRefreshToken();
    this.log("All refresh tokens for your user have been revoked.");
  }
}

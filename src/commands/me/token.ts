import { Flags } from "@oclif/core";
import { getAccessToken } from "../../auth.js";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { getAuthContext } from "../../context.js";
export default class PrintTokenCommand extends PrismaticBaseCommand {
  static description = "Print your authorization tokens";

  static flags = {
    type: Flags.string({
      char: "t",
      description: "Which token type to print",
      options: ["access", "refresh"],
      default: "access",
    }),
  };

  async run() {
    const {
      flags: { type: tokenType },
    } = await this.parse(PrintTokenCommand);

    const token =
      tokenType === "access" ? await getAccessToken() : (await getAuthContext()).refreshToken;
    this.log(token);
  }
}

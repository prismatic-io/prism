import { Command, Flags } from "@oclif/core";
import { getAccessToken } from "../../auth";
import { readConfig } from "../../config";
export default class PrintTokenCommand extends Command {
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

    //refresh before logging token
    await getAccessToken();

    const config = await readConfig();
    const token =
      tokenType === "access" ? config?.accessToken : config?.refreshToken;
    this.log(token);
  }
}

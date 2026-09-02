import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { getAccessToken } from "../../auth.js";
import { getAuthContext } from "../../context.js";
export default defineCommand({
  description: "Print your authorization tokens",
  options: {
    type: option.string({
      char: "t",
      description: "Which token type to print",
      options: ["access", "refresh"],
      default: "access",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { type: tokenType },
    } = commandInput();

    const token =
      tokenType === "access" ? await getAccessToken() : (await getAuthContext()).refreshToken;
    commandOutput.log(token);
  },
});

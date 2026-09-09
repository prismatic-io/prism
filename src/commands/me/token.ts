import { z, Cli } from "incur";
import { getAccessToken } from "../../auth.js";
import { writeCommandStatus } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { warningsOutput } from "../../output.js";
export default Cli.command({
  output: z.object({
    ...warningsOutput,
    token: z.string().nullable(),
    type: z.enum(["access", "refresh"]),
  }),
  description: "Print your authorization tokens",
  options: z.object({
    type: z.enum(["access", "refresh"]).default("access").describe("Which token type to print"),
  }),
  async run(context) {
    const {
      options: { type: tokenType },
    } = context;

    const token =
      tokenType === "access" ? await getAccessToken() : (await getAuthContext()).refreshToken;
    writeCommandStatus(token ?? "");
    return { token: token ?? null, type: tokenType };
  },
  alias: { type: "t" },
});

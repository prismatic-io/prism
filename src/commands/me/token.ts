import { z } from "incur";
import { getAccessToken } from "../../auth.js";
import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { resultOutput, warningsOutput } from "../../output.js";
export default defineCommand({
  output: z.object({
    ...warningsOutput,
    token: z.string().nullable(),
    type: z.enum(["access", "refresh"]),
  }),
  description: "Print your authorization tokens",
  options: optionsSchema(
    z.object({
      type: z
        .enum(["access", "refresh"])
        .default("access")
        .describe("Which token type to print")
        .meta({ cli: { char: "t" } }),
    }),
  ),
  async run(context) {
    const {
      options: { type: tokenType },
    } = context;

    const token =
      tokenType === "access" ? await getAccessToken() : (await getAuthContext()).refreshToken;
    commandOutput.log(token);
    return resultOutput(context, { token: token ?? null, type: tokenType });
  },
});

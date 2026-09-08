import { z } from "incur";
import { revokeRefreshToken } from "../../../auth.js";
import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { resultOutput, warningsOutput } from "../../../output.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  mutates: true,
  output: z.object({
    revoked: z.literal(true),
    authentication: z.enum(["environment", "profile"]),
    ...warningsOutput,
  }),
  description: "Revoke all refresh tokens for your user",
  options: optionsSchema(
    z.object({
      confirm: z
        .boolean()
        .default(true)
        .describe("Prompt for confirmation before revoking tokens. Use --no-confirm to skip.")
        .meta({ cli: { allowNo: true } }),
    }),
  ),
  async run(context) {
    const {
      options: { confirm },
    } = context;

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
    return resultOutput(context, { revoked: true, authentication: source });
  },
});

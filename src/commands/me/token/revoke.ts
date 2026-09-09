import { confirm as confirmPrompt } from "../../../utils/prompts.js";
import { z, Cli, Errors } from "incur";
import { revokeRefreshToken } from "../../../auth.js";
import { writeCommandStatus, writeCommandOutput } from "../../../command.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z.object({
    revoked: z.literal(true),
    authentication: z.enum(["environment", "profile"]),
    ...warningsOutput,
  }),
  description: "Revoke all refresh tokens for your user",
  options: z.object({
    confirm: z
      .boolean()
      .default(true)
      .describe("Prompt for confirmation before revoking tokens. Use --no-confirm to skip."),
  }),
  async run(context) {
    const {
      options: { confirm },
    } = context;

    if (confirm) {
      const shouldContinue = await confirmPrompt(
        "This will revoke all refresh tokens for the current user. Continue? (yes/no)",
      );
      if (!shouldContinue) {
        throw new Errors.IncurError({
          code: "COMMAND_FAILED",
          message: "Operation canceled",
          exitCode: 1,
        });
      }
    }

    const source = await revokeRefreshToken();
    writeCommandStatus("All refresh tokens for your user have been revoked.");
    if (source === "environment") {
      writeCommandOutput(
        "Remove PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN from your environment before running more commands.",
        "stderr",
      );
    }
    return { revoked: true as const, authentication: source };
  },
});

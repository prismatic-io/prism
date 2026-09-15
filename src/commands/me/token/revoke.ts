import { Cli, z } from "incur";
import { revokeRefreshToken } from "../../../auth.js";
import { writeCommandOutput, writeCommandStatus } from "../../../command.js";
import { CommandFailedError } from "../../../errors.js";
import { warningsOutput } from "../../../output.js";
import { confirm as confirmPrompt } from "../../../utils/prompts.js";

export default Cli.command({
  output: z.object({
    revoked: z.literal(true),
    authentication: z.enum(["environment", "profile"]),
    ...warningsOutput,
  }),
  description: "Revoke all refresh tokens for your user",
  async run() {
    const shouldContinue = await confirmPrompt(
      "This will revoke all refresh tokens for the current user. Continue? (yes/no)",
    );
    if (!shouldContinue) {
      throw new CommandFailedError({
        message: "Operation canceled",
      });
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

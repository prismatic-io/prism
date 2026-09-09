import { Cli, Errors, z } from "incur";
import { logout } from "../auth.js";
import { writeCommandOutput, writeCommandStatus } from "../command.js";
import { hasEnvironmentCredentials, readProfileSelection } from "../context.js";

export default Cli.command({
  output: z.object({
    profile: z.string(),
    loggedOut: z.literal(true),
    environmentCredentialsActive: z.boolean(),
    warnings: z.array(z.string()).optional(),
  }),
  description: "Log out of your Prismatic account",
  options: z.object({
    browser: z
      .boolean()
      .optional()
      .describe("additionally log out of your default browser's session"),
  }),
  async run(context) {
    const {
      options: { browser },
    } = context;

    const { store, name: profileName } = await readProfileSelection();
    const environmentCredentialsActive = hasEnvironmentCredentials();

    if (browser) {
      await logout();
    }

    const result = await store.deleteProfile(profileName);
    if (!result.deleted) {
      const environmentHint = environmentCredentialsActive
        ? " Environment credentials remain active until you unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN."
        : "";
      throw new Errors.IncurError({
        code: "COMMAND_FAILED",
        message: `Profile '${profileName}' does not exist.${environmentHint}`,
        exitCode: 1,
      });
    }
    writeCommandStatus(`Logged out of '${profileName}'.`);
    if (environmentCredentialsActive) {
      writeCommandOutput(
        "Environment credentials are still active. Unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN to stop using them.",
        "stderr",
      );
    }
    return {
      profile: profileName,
      loggedOut: true as const,
      environmentCredentialsActive,
      ...(environmentCredentialsActive
        ? { warnings: ["Environment credentials remain active until unset."] }
        : {}),
    };
  },
  alias: { browser: "b" },
});

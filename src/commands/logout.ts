import { commandOutput, defineCommand, optionsSchema } from "../command.js";
import { logout } from "../auth.js";
import { deleteProfile, getActiveProfileName } from "../config.js";
import { hasEnvironmentCredentials } from "../context.js";
import { z } from "incur";

export default defineCommand({
  output: z.object({
    profile: z.string(),
    loggedOut: z.literal(true),
    environmentCredentialsActive: z.boolean(),
    warnings: z.array(z.string()).optional(),
  }),
  mutates: true,
  description: "Log out of your Prismatic account",
  options: optionsSchema(
    z.object({
      browser: z
        .boolean()
        .optional()
        .describe("additionally log out of your default browser's session")
        .meta({ cli: { char: "b" } }),
    }),
  ),
  authContext: "profile" as const,
  async run(context) {
    const {
      options: { browser },
    } = context;

    const profileName = await getActiveProfileName();
    const environmentCredentialsActive = hasEnvironmentCredentials();

    if (browser) {
      await logout();
    }

    const result = await deleteProfile(profileName);
    if (!result.deleted) {
      const environmentHint = environmentCredentialsActive
        ? " Environment credentials remain active until you unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN."
        : "";
      commandOutput.error(`Profile '${profileName}' does not exist.${environmentHint}`, {
        exit: 1,
      });
    }
    commandOutput.log(`Logged out of '${profileName}'.`);
    if (environmentCredentialsActive) {
      commandOutput.warn(
        "Environment credentials are still active. Unset PRISM_ACCESS_TOKEN and PRISM_REFRESH_TOKEN to stop using them.",
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
});

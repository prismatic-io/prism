import { Cli, Errors, z } from "incur";
import { writeCommandStatus } from "../../command.js";
import { getConfigStore } from "../../context.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z.object({
    profile: z.string(),
    deleted: z.literal(true),
    defaultProfile: z.string().nullable(),
    ...warningsOutput,
  }),
  description: "Delete a profile",
  args: z.object({
    name: z.string().describe("Profile to delete"),
  }),
  async run(context) {
    const {
      args: { name },
    } = context;

    const result = await getConfigStore().deleteProfile(name);
    if (!result.deleted) {
      throw new Errors.IncurError({
        code: "COMMAND_FAILED",
        message: `Profile '${name}' does not exist.`,
        exitCode: 1,
      });
    }

    if (result.isLast) {
      writeCommandStatus(`Deleted '${name}'. No profiles remain.`);
      return { profile: name, deleted: true as const, defaultProfile: null };
    }

    writeCommandStatus(`Deleted '${name}'.`);
    if (result.defaultChanged) {
      writeCommandStatus(`Default profile is now '${result.defaultProfile}'.`);
    }
    return {
      profile: name,
      deleted: true as const,
      defaultProfile: result.defaultProfile ?? null,
    };
  },
});

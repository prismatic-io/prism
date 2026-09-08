import { z } from "incur";
import { commandOutput, defineCommand, argsSchema } from "../../command.js";
import { deleteProfile } from "../../config.js";
import { resultOutput, warningsOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: z.object({
    profile: z.string(),
    deleted: z.literal(true),
    defaultProfile: z.string().nullable(),
    ...warningsOutput,
  }),
  description: "Delete a profile",
  args: argsSchema(
    z.object({
      name: z.string().describe("Profile to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { name },
    } = context;

    const result = await deleteProfile(name);
    if (!result.deleted) {
      commandOutput.error(`Profile '${name}' does not exist.`, { exit: 1 });
    }

    if (result.isLast) {
      commandOutput.log(`Deleted '${name}'. No profiles remain.`);
      return resultOutput(context, { profile: name, deleted: true, defaultProfile: null });
    }

    commandOutput.log(`Deleted '${name}'.`);
    if (result.defaultChanged) {
      commandOutput.log(`Default profile is now '${result.defaultProfile}'.`);
    }
    return resultOutput(context, {
      profile: name,
      deleted: true,
      defaultProfile: result.defaultProfile ?? null,
    });
  },
});

import { Cli, z } from "incur";
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
      return context.error({
        code: "NOT_FOUND",
        retryable: false,
        cta: { commands: [{ command: "profiles list", description: "List available profiles" }] },
        message: `Profile '${name}' does not exist.`,
        exitCode: 1,
      });
    }

    if (result.isLast) {
      writeCommandStatus(`Deleted '${name}'. No profiles remain.`);
      return context.ok(
        { profile: name, deleted: true, defaultProfile: null },
        {
          cta: {
            commands: [
              {
                command: "login",
                description: "Authenticate a new default profile",
                options: { profile: "default" },
              },
            ],
          },
        },
      );
    }

    writeCommandStatus(`Deleted '${name}'.`);
    if (result.defaultChanged) {
      writeCommandStatus(`Default profile is now '${result.defaultProfile}'.`);
    }
    return context.ok(
      {
        profile: name,
        deleted: true,
        defaultProfile: result.defaultProfile ?? null,
      },
      {
        cta: {
          commands: [{ command: "profiles list", description: "Inspect the remaining profiles" }],
        },
      },
    );
  },
});

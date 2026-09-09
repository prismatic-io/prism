import { Cli, z } from "incur";
import { writeCommandStatus } from "../../command.js";
import { useProfile } from "../../config.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z.object({ profile: z.string() }).extend(warningsOutput),
  description: "Set the default profile",
  args: z.object({
    name: z.string().describe("Profile to use by default"),
  }),
  async run(context) {
    const {
      args: { name },
    } = context;

    await useProfile(name);
    writeCommandStatus(`Using '${name}' by default.`);
    return { profile: name };
  },
});

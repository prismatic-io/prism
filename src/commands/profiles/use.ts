import { commandOutput, defineCommand, argsSchema } from "../../command.js";
import { useProfile } from "../../config.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";
import { z } from "incur";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("profile"),
  description: "Set the default profile",
  args: argsSchema(
    z.object({
      name: z.string().describe("Profile to use by default"),
    }),
  ),
  async run(context) {
    const {
      args: { name },
    } = context;

    await useProfile(name);
    commandOutput.log(`Using '${name}' by default.`);
    return resultOutput(context, { profile: name });
  },
});

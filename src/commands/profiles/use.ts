import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  type CommandContext,
} from "../../command.js";
import { useProfile } from "../../config.js";

export default defineCommand({
  description: "Set the default profile",
  args: {
    name: arg.string({
      required: true,
      description: "Profile to use by default",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { name },
    } = commandInput();

    await useProfile(name);
    commandOutput.log(`Using '${name}' by default.`);
  },
});

import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  type CommandContext,
} from "../../command.js";
import { deleteProfile } from "../../config.js";

export default defineCommand({
  description: "Delete a profile",
  args: {
    name: arg.string({
      required: true,
      description: "Profile to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { name },
    } = commandInput();

    const result = await deleteProfile(name);
    if (!result.deleted) {
      commandOutput.error(`Profile '${name}' does not exist.`, { exit: 1 });
    }

    if (result.isLast) {
      commandOutput.log(`Deleted '${name}'. No profiles remain.`);
      return;
    }

    commandOutput.log(`Deleted '${name}'.`);
    if (result.defaultChanged) {
      commandOutput.log(`Default profile is now '${result.defaultProfile}'.`);
    }
  },
});

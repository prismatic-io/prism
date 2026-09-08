import { Completions, z } from "incur";
import { commandOutput, writeCommandOutput, defineCommand, argsSchema } from "../../command.js";

export default defineCommand({
  outputPolicy: "agent-only",
  output: z.object({ shell: z.enum(["bash", "zsh"]).optional(), script: z.string() }),
  description: "outputs autocomplete config script for shells",
  args: argsSchema(
    z.object({
      shell: z.enum(["zsh", "bash", "powershell"]).optional(),
    }),
  ),
  run(context) {
    const {
      args: { shell },
    } = context;
    if (!shell) return { script: "" };
    if (shell === "powershell") {
      commandOutput.error(
        "PowerShell completion is not supported in CLIs using colon as the topic separator.\nSee: https://oclif.io/docs/topic_separator",
      );
    }
    if (shell !== "bash" && shell !== "zsh") commandOutput.error(`Unsupported shell: ${shell}`);
    const script = Completions.register(shell, "prism");
    writeCommandOutput(script);
    return { shell, script };
  },
});

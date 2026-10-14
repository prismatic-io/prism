import { Cli, Completions, z } from "incur";
import { writeCommandOutput } from "../../command.js";
import { ValidationError } from "../../errors.js";

export default Cli.command({
  outputPolicy: "agent-only",
  output: z.object({ shell: z.enum(["bash", "zsh"]).optional(), script: z.string() }),
  description: "outputs autocomplete config script for shells",
  args: z.object({
    shell: z.enum(["zsh", "bash", "powershell"]).optional(),
  }),
  run(context) {
    const {
      args: { shell },
    } = context;
    if (!shell) return { script: "" };
    if (shell === "powershell") {
      throw new ValidationError({
        message:
          "PowerShell completion is not supported in CLIs using colon as the topic separator.\nSee: https://oclif.io/docs/topic_separator",
      });
    }
    if (shell !== "bash" && shell !== "zsh")
      throw new ValidationError({
        message: `Unsupported shell: ${shell}`,
      });
    const script = Completions.register(shell, "prism");
    writeCommandOutput(script);
    return { shell, script };
  },
});

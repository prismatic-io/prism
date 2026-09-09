import { Completions, z, Cli, Errors } from "incur";
import { writeCommandOutput } from "../../command.js";

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
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message:
          "PowerShell completion is not supported in CLIs using colon as the topic separator.\nSee: https://oclif.io/docs/topic_separator",
        exitCode: 2,
      });
    }
    if (shell !== "bash" && shell !== "zsh")
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: `Unsupported shell: ${shell}`,
        exitCode: 2,
      });
    const script = Completions.register(shell, "prism");
    writeCommandOutput(script);
    return { shell, script };
  },
});

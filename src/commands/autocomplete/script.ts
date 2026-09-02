import { Completions } from "incur";
import { arg, commandInput, commandOutput, defineCommand } from "../../command.js";

export default defineCommand({
  description: "outputs autocomplete config script for shells",
  args: {
    shell: arg.string({ options: ["zsh", "bash", "powershell"] }),
  },
  run() {
    const {
      args: { shell },
    } = commandInput();
    if (!shell) return;
    if (shell === "powershell") {
      commandOutput.error(
        "PowerShell completion is not supported in CLIs using colon as the topic separator.\nSee: https://oclif.io/docs/topic_separator",
      );
    }
    if (shell !== "bash" && shell !== "zsh") commandOutput.error(`Unsupported shell: ${shell}`);
    commandOutput.log(Completions.register(shell, "prism"));
  },
});

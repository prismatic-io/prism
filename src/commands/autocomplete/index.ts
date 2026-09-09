import { writeCommandOutput } from "../../command.js";
import { z, Cli, Errors } from "incur";

const zshInstructions = `
Setup Instructions for PRISM CLI Autocomplete ---
==============================================

1) Run this command in your terminal window:

  printf "$(prism autocomplete:script zsh)" >> ~/.zshrc; source ~/.zshrc

  The previous command adds the PRISM_AC_ZSH_SETUP_PATH environment variable to your zsh config file and then sources the file.

2) (Optional) Run this command to ensure that you have no permissions conflicts:

  compaudit -D

3) Start using autocomplete:

  prism <TAB>                  # Command completion
  prism command --<TAB>        # Flag completion
  
  Every time you enter <TAB>, the autocomplete feature displays a list of commands (or flags if you type --), along with their summaries. Enter a letter and then <TAB> again to narrow down the list until you end up with the complete command that you want to execute.

  Enjoy!
`;

const bashInstructions = `
Setup Instructions for PRISM CLI Autocomplete ---
==============================================

1) Run this command in your terminal window:

  printf "$(prism autocomplete:script bash)" >> ~/.bashrc; source ~/.bashrc

  The previous command adds the PRISM_AC_BASH_SETUP_PATH environment variable to your Bash config file and then sources the file.

  NOTE: If you’ve configured your terminal to start as a login shell, you may need to modify the command so it updates either the ~/.bash_profile or ~/.profile file. For example:

  printf "$(prism autocomplete:script bash)" >> ~/.bash_profile; source ~/.bash_profile

  Or:

  printf "$(prism autocomplete:script bash)" >> ~/.profile; source ~/.profile

2) Start using autocomplete:

  prism <TAB><TAB>                  # Command completion
  prism command --<TAB><TAB>        # Flag completion
  
  Every time you enter <TAB><TAB>, the autocomplete feature displays a list of commands (or flags if you type --), along with their summaries. Enter a letter and then <TAB><TAB> again to narrow down the list until you end up with the complete command that you want to execute.

  Enjoy!
`;

export default Cli.command({
  outputPolicy: "agent-only",
  output: z.object({
    shell: z.enum(["bash", "zsh"]).optional(),
    instructions: z.string(),
    refreshed: z.boolean(),
  }),
  description: "Display autocomplete installation instructions.",
  args: z.object({
    shell: z.enum(["zsh", "bash", "powershell"]).optional(),
  }),
  options: z.object({
    "refresh-cache": z
      .boolean()
      .optional()
      .describe("Refresh cache (ignores displaying instructions)"),
  }),
  examples: [
    {},
    { args: { shell: "bash" } },
    { args: { shell: "zsh" } },
    { args: { shell: "powershell" } },
    { options: { "refresh-cache": true } },
  ],
  run(context) {
    const {
      args: { shell },
      options: { "refresh-cache": refreshCache },
    } = context;
    writeCommandOutput("Building the autocomplete cache... done", "stderr");
    if (refreshCache) return { instructions: "", refreshed: true };
    const selectedShell = shell ?? (process.env.SHELL?.endsWith("bash") ? "bash" : "zsh");
    if (selectedShell === "powershell") {
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message:
          "PowerShell completion is not supported in CLIs using colon as the topic separator.\nSee: https://oclif.io/docs/topic_separator",
        exitCode: 2,
      });
    }
    const instructions = selectedShell === "bash" ? bashInstructions : zshInstructions;
    writeCommandOutput(instructions);
    return { shell: selectedShell, instructions, refreshed: false };
  },
  alias: { "refresh-cache": "r" },
});

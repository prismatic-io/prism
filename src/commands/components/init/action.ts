import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateActionCommand extends Command {
  static description = "Initialize a new Action file";

  async run() {
    await this.parse(GenerateActionCommand);
    await runGenerator("action");
  }
}

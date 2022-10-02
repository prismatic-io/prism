import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateTriggerCommand extends Command {
  static description = "Initialize a new Trigger file";

  async run() {
    await this.parse(GenerateTriggerCommand);
    await runGenerator("trigger");
  }
}

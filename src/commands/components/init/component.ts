import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateComponentCommand extends Command {
  static description = "Initialize a new Component";

  async run() {
    await this.parse(GenerateComponentCommand);
    await runGenerator("component");
  }
}

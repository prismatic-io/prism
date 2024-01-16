import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateFlowCommand extends Command {
  static description =
    "Initialize a new file for a Code Native Integration Flow";

  async run() {
    await this.parse(GenerateFlowCommand);
    await runGenerator("flow");
  }
}

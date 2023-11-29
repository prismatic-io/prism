import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateIntegrationCommand extends Command {
  static description = "Initialize a new Code Native Integration";

  async run() {
    await this.parse(GenerateIntegrationCommand);
    await runGenerator("integration");
  }
}

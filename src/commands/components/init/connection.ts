import { Command } from "@oclif/core";
import { runGenerator } from "../../../yeoman";

export default class GenerateConnectionCommand extends Command {
  static description = "Initialize a new Connection file";

  async run() {
    await this.parse(GenerateConnectionCommand);
    await runGenerator("connection");
  }
}

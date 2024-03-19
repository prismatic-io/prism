import { Command, Config, Flags } from "@oclif/core";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import { v4 as uuid4 } from "uuid";
import { template, toArgv } from "../../../generate/util.js";
import path from "path";

export default class GenerateFlowCommand extends Command {
  static description = "Initialize a new file for a Code Native Integration Flow";
  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the flow",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the flow",
    }),
    destinationPath: Flags.string({
      hidden: true,
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateFlowCommand);
    const { name, description } = await inquirer.prompt<{
      name: string;
      description: string;
    }>(
      [
        {
          type: "input",
          name: "name",
          message: "Name of the flow",
          when: () => !flags.name,
        },
        {
          type: "input",
          name: "description",
          message: "Description for the flow",
          when: () => !flags.description,
        },
      ],
      flags,
    );

    const key = camelCase(name);
    const destination = flags.destinationPath || `${key}.ts`;
    await template(path.join("flow", "flow.ts.ejs"), destination, {
      flow: { name, key, description, stableKey: uuid4() },
    });
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateFlowCommand.run(toArgv(args), config);
  }
}

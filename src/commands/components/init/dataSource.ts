import { Command, Config, Flags } from "@oclif/core";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import { template, toArgv } from "../../../generate/util.js";
import path from "path";

export default class GenerateDataSourceCommand extends Command {
  static description = "Initialize a new Data Source file";
  static flags = {
    label: Flags.string({
      char: "l",
      description: "Label for the data source",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the data source",
    }),
    destinationPath: Flags.string({
      description: "Path to the destination file",
      hidden: true,
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateDataSourceCommand);
    const { label, description } = await inquirer.prompt<{
      label: string;
      description: string;
    }>(
      [
        {
          type: "input",
          name: "label",
          message: "Label for the data source",
          when: () => !flags.label,
        },
        {
          type: "input",
          name: "description",
          message: "Description for the data source",
          when: () => !flags.description,
        },
      ],
      flags,
    );

    const key = camelCase(label);
    const destination = flags.destinationPath || `${key}.ts`;
    await template(path.join("dataSource", "dataSource.ts.ejs"), destination, {
      dataSource: { label, description, key },
    });
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateDataSourceCommand.run(toArgv(args), config);
  }
}

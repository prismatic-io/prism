import { Command, Config, Flags } from "@oclif/core";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import { template, toArgv } from "../../../generate/util.js";
import path from "path";

export const connectionTypes = {
  basic: "Basic Connection",
  oauth: "OAuth 2.0",
};
export type ConnectionType = keyof typeof connectionTypes;

export default class GenerateConnectionCommand extends Command {
  static description = "Initialize a new Connection file";
  static flags = {
    label: Flags.string({
      char: "l",
      description: "Label for the connection",
    }),
    comments: Flags.string({
      char: "c",
      description: "Comments for the connection",
    }),
    connectionType: Flags.string({
      char: "t",
      description: "Type of connection",
      options: Object.keys(connectionTypes),
    }),
    destinationPath: Flags.string({
      description: "Path to the destination file",
      hidden: true,
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateConnectionCommand);
    const { label, comments, connectionType } = await inquirer.prompt<{
      label: string;
      comments: string;
      connectionType: string;
    }>(
      [
        {
          type: "input",
          name: "label",
          message: "Label for the connection",
          when: () => !flags.label,
        },
        {
          type: "input",
          name: "comments",
          message: "Comments for the connection",
          when: () => !flags.comments,
        },
        {
          type: "list",
          name: "connectionType",
          message: "Type of connection",
          choices: Object.entries(connectionTypes).map(([key, value]) => ({
            name: value,
            value: key,
          })),
          when: () => !flags.connectionType,
        },
      ],
      flags,
    );

    const key = camelCase(label);
    const destination = flags.destinationPath || `${key}.ts`;
    await template(path.join("connection", `${connectionType}.ts.ejs`), destination, {
      connection: { label, comments, key },
    });
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateConnectionCommand.run(toArgv(args), config);
  }
}

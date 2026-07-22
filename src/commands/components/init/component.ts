import { type Config, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import path from "path";
import { template, toArgv } from "../../../generate/util.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default class GenerateComponentCommand extends PrismaticBaseCommand {
  static hidden = true;
  static description = "Initialize a new Component";
  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the component",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the component",
    }),
    toolchain: Flags.option({
      options: TOOLCHAIN_NAMES,
      default: DEFAULT_TOOLCHAIN,
      hidden: true,
    })(),
  };

  async run() {
    const { flags } = await this.parse(GenerateComponentCommand);
    const toolchain = getToolchain(flags.toolchain);
    const { name, description } = await inquirer.prompt<{
      name: string;
      description: string;
    }>(
      [
        {
          type: "input",
          name: "name",
          message: "Name of the component",
          when: () => !flags.name,
        },
        {
          type: "input",
          name: "description",
          message: "Description for the component",
          when: () => !flags.description,
        },
      ],
      flags,
    );

    const context = { component: { name, description, key: camelCase(name) } };
    const sharedFiles = [
      path.join("assets", "icon.png"),
      path.join("src", "actions.test.ts"),
      path.join("src", "actions.ts"),
      path.join("src", "client.ts"),
      path.join("src", "connections.ts"),
      path.join("src", "dataSources.test.ts"),
      path.join("src", "dataSources.ts"),
      path.join("src", "index.ts"),
      path.join("src", "triggers.test.ts"),
      path.join("src", "triggers.ts"),
      ".env.testing",
      "package.json",
    ];
    await Promise.all([
      ...sharedFiles.map((file) =>
        template(
          path.join("component", file.endsWith("icon.png") ? file : `${file}.ejs`),
          file,
          context,
        ),
      ),
      toolchain.renderTemplates(context),
    ]);
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateComponentCommand.run(toArgv(args), config);
  }
}

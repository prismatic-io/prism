import {
  commandInput,
  defineCommand,
  option,
  requireInteractiveInput,
  type CommandContext,
} from "../../../command.js";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import path from "path";
import { template } from "../../../generate/util.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default defineCommand({
  hidden: true,
  description: "Initialize a new Component",
  options: {
    name: option.string({
      char: "n",
      description: "Name of the component",
    }),
    description: option.string({
      char: "d",
      description: "Description for the component",
    }),
    toolchain: option.custom({
      options: TOOLCHAIN_NAMES,
      default: DEFAULT_TOOLCHAIN,
      hidden: true,
    })(),
  },
  async run(_commandContext: CommandContext) {
    const { flags } = commandInput();
    const toolchain = getToolchain(flags.toolchain);
    if (!flags.name || !flags.description) {
      requireInteractiveInput(
        "Agent mode requires both --name and --description for components:init:component",
      );
    }
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
  },
});

import { Command, Config, Flags } from "@oclif/core";
import { connectionTypes } from "./connection.js";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import path from "path";
import { template, toArgv, updatePackageJson } from "../../../generate/util.js";
import GenerateActionCommand from "./action.js";
import GenerateConnectionCommand from "./connection.js";
import GenerateDataSourceCommand from "./dataSource.js";
import GenerateTriggerCommand from "./trigger.js";

export default class GenerateComponentCommand extends Command {
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
    connectionType: Flags.string({
      char: "t",
      description: "Type of component",
      options: Object.keys(connectionTypes),
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateComponentCommand);
    const { name, description, connectionType } = await inquirer.prompt<{
      name: string;
      description: string;
      connectionType: string;
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

    const context = { component: { name, description, key: camelCase(name) } };
    const templateFiles = [
      path.join("assets", "icon.png"),
      path.join("src", "index.ts"),
      path.join("src", "index.test.ts"),
      path.join("src", "client.ts"),
      "jest.config.js",
      "package.json",
      "tsconfig.json",
      "webpack.config.js",
    ];
    await Promise.all([
      ...templateFiles.map((file) =>
        template(path.join("component", `${file}.ejs`), file, context),
      ),
      GenerateActionCommand.invoke(
        {
          label: "My Action",
          description: "This is my action",
          destinationPath: path.join("src", "actions.ts"),
        },
        this.config,
      ),
      GenerateConnectionCommand.invoke(
        {
          label: "My Connection",
          comments: "This is my connection",
          connectionType,
          destinationPath: path.join("src", "connections.ts"),
        },
        this.config,
      ),
      GenerateDataSourceCommand.invoke(
        {
          label: "My Data Source",
          description: "This is my data source",
          destinationPath: path.join("src", "dataSources.ts"),
        },
        this.config,
      ),
      GenerateTriggerCommand.invoke(
        {
          label: "My Trigger",
          description: "This is my trigger",
          destinationPath: path.join("src", "triggers.ts"),
        },
        this.config,
      ),
    ]);

    await updatePackageJson({
      path: "package.json",
      scripts: {
        build: "webpack",
        publish: "npm run build && prism components:publish",
        "generate:manifest": "npm run build && npx @prismatic-io/spectral component-manifest --include-signature",
        "generate:manifest:dev": "npm run build && npx @prismatic-io/spectral component-manifest",
        test: "jest",
        lint: "eslint --ext .ts .",
      },
      eslintConfig: {
        root: true,
        extends: ["@prismatic-io/eslint-config-spectral"],
      },
      dependencies: {
        "@prismatic-io/spectral": "*",
      },
      devDependencies: {
        "@prismatic-io/eslint-config-spectral": "2.0.1",
        "@types/jest": "29.5.11",
        "copy-webpack-plugin": "11.0.0",
        eslint: "8.57.0",
        jest: "29.7.0",
        "ts-jest": "29.1.1",
        "ts-loader": "9.2.3",
        typescript: "4.3.5",
        webpack: "5.76.3",
        "webpack-cli": "5.0.1",
      },
    });
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateComponentCommand.run(toArgv(args), config);
  }
}

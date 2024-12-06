import { Command, Config, Flags } from "@oclif/core";
import { connectionTypes } from "../../components/init/connection.js";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import { v4 as uuid4 } from "uuid";
import path from "path";
import { template, toArgv, updatePackageJson } from "../../../generate/util.js";
import GenerateFlowCommand from "./flow.js";
import { prismaticUrl } from "../../../auth.js";

export default class GenerateIntegrationCommand extends Command {
  static description = "Initialize a new Code Native Integration";
  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the integration",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the integration",
    }),
    connectionType: Flags.string({
      char: "t",
      description: "Type of connection",
      options: Object.keys(connectionTypes),
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateIntegrationCommand);

    const { name, description, connectionType } = await inquirer.prompt<{
      name: string;
      description: string;
      connectionType: string;
    }>(
      [
        {
          type: "input",
          name: "name",
          message: "Name of the integration",
          when: () => !flags.name,
        },
        {
          type: "input",
          name: "description",
          message: "Description for the integration",
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

    const configVarLabel = "Connection 1";
    const flowName = "Flow 1";

    const context = {
      integration: { name, description, key: camelCase(name) },
      configVar: {
        key: camelCase(configVarLabel),
        stableKey: uuid4(),
        label: configVarLabel,
        connectionType,
      },
      flow: { name: flowName },
      registry: {
        url: new URL("/packages/npm", prismaticUrl).toString(),
        scope: "@component-manifests",
      },
    };

    const templateFiles = [
      path.join("assets", "icon.png"),
      path.join("src", "index.ts"),
      path.join("src", "index.test.ts"),
      path.join("src", "client.ts"),
      path.join("src", "componentRegistry.ts"),
      path.join(".spectral", "index.ts"),
      ".npmrc",
      "jest.config.js",
      "package.json",
      "tsconfig.json",
      "webpack.config.js",
    ];
    await Promise.all([
      ...templateFiles.map((file) =>
        template(
          path.join("integration", file.endsWith("icon.png") ? file : `${file}.ejs`),
          file,
          context,
        ),
      ),
      template(
        path.join("integration", `${connectionType}.ts.ejs`),
        path.join("src", "configPages.ts"),
        context,
      ),
      GenerateFlowCommand.invoke(
        {
          name: flowName,
          description: "This is the first flow",
          destinationPath: path.join("src", "flows.ts"),
        },
        this.config,
      ),
    ]);

    await updatePackageJson({
      path: "package.json",
      scripts: {
        build: "webpack",
        import: "npm run build && prism integrations:import",
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
        "@types/jest": "29.5.12",
        "copy-webpack-plugin": "12.0.2",
        jest: "29.7.0",
        "ts-jest": "29.1.2",
        "ts-loader": "9.5.1",
        typescript: "5.5.3",
        webpack: "5.91.0",
        "webpack-cli": "5.1.4",
      },
    });

    this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To run unit tests for the integration, run "npm run test" or "yarn test"
To build the integration, run "npm run build" or "yarn build"
To import the integration, run "prism integrations:import"

For documentation on writing code-native integrations, visit https://prismatic.io/docs/code-native-integrations/
    `);
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateIntegrationCommand.run(toArgv(args), config);
  }
}

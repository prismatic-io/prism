import path from "path";
import { Args, Command } from "@oclif/core";
import fs from "fs/promises";
import { camelCase } from "lodash-es";
import { v4 as uuid4 } from "uuid";
import { prismaticUrl } from "../../../auth.js";
import { template, updatePackageJson } from "../../../generate/util.js";
import { VALID_NAME_REGEX } from "../../../utils/generate.js";
import { devDependencies } from "../../../utils/devDependencies.js";

export default class InitializeIntegration extends Command {
  static description = "Initialize a new Code Native Integration";
  static args = {
    name: Args.string({
      required: true,
      description:
        "Name of the new integration to create (alphanumeric characters, hyphens, and underscores)",
    }),
  };

  async run() {
    const {
      args: { name },
    } = await this.parse(InitializeIntegration);

    if (!VALID_NAME_REGEX.test(name)) {
      this.error(
        `'${name}' contains invalid characters. Please select an integration name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See https://regex101.com/?regex=${encodeURIComponent(
          VALID_NAME_REGEX.source,
        )}`,
        { exit: 1 },
      );
    }

    await fs.mkdir(name);
    process.chdir(name);

    const context = {
      integration: { name, description: "Prism-generated Integration", key: camelCase(name) },
      flow: {
        stableKey: uuid4(),
      },
      configVars: {
        connection: {
          stableKey: uuid4(),
        },
        dataSource: {
          stableKey: uuid4(),
        },
      },
      registry: {
        url: new URL("/packages/npm", prismaticUrl).toString(),
        scope: "@component-manifests",
      },
    };

    const templateFiles = [
      path.join("assets", "icon.png"),
      path.join("src", "index.ts"),
      path.join("src", "client.ts"),
      path.join("src", "flows.ts"),
      path.join("src", "flows.test.ts"),
      path.join("src", "configPages.ts"),
      path.join("src", "componentRegistry.ts"),
      path.join(".spectral", "index.ts"),
      path.join(".vscode", "extensions.json"),
      path.join(".vscode", "settings.json"),
      ".npmrc",
      ".test.env",
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
      devDependencies,
    });

    this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To run unit tests for the integration, run "npm run test" or "yarn test"
To build the integration, run "npm run build" or "yarn build"
To import the integration, run "prism integrations:import"

For documentation on writing code-native integrations, visit https://prismatic.io/docs/integrations/code-native/
    `);
  }
}

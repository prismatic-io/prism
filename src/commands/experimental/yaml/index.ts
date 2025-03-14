import { Command, Config, Flags } from "@oclif/core";
import path from "path";
import { template, toArgv } from "../../../generate/util.js";
import { exists } from "../../../fs.js";
import { promises as fs } from "fs";
import { load } from "js-yaml";
import { v4 as uuid4 } from "uuid";
import { prismaticUrl } from "../../../auth.js";
import { writeIntegration, writePackageJson } from "../../../generate/formats/writer/yaml/index.js";
import { IntegrationObjectFromYAML } from "../../../generate/formats/writer/yaml/types.js";

export default class GenerateIntegrationFromYAMLCommand extends Command {
  static description = "Initialize a new Code Native Integration based on a YAML file";
  static flags = {
    yamlFile: Flags.string({
      required: true,
      char: "y",
      description: "YAML filepath",
    }),
    folder: Flags.string({
      required: false,
      char: "f",
      description:
        "Optional: Folder name to install the integration into (by default we will kebab-case your integration name)",
    }),
    registryPrefix: Flags.string({
      required: false,
      char: "r",
      description: "Optional: Your custom NPM registry prefix",
    }),
  };

  async run() {
    const cwd = process.cwd();

    try {
      const { flags } = await this.parse(GenerateIntegrationFromYAMLCommand);
      const { yamlFile, registryPrefix, folder } = flags;

      const yamlExists = await exists(yamlFile);

      if (!yamlExists) {
        this.error("Could not find a YAML file at the given filepath.");
      }

      const result = load(await fs.readFile(yamlFile, "utf-8")) as IntegrationObjectFromYAML;

      if (result.definitionVersion !== 7) {
        throw `
The provided YAML definition version is incompatible with the CNI generator.
Use "prism integrations:version:download $INTEGRATION_ID" to download a compatible version.`;
      }

      const integrationKey = uuid4();

      const context = {
        integration: {
          name: result.name,
          description: result.description,
          key: integrationKey,
        },
        registry: {
          url: new URL("/packages/npm", prismaticUrl).toString(),
          scope: "@component-manifests",
        },
      };

      const folderName = folder ?? result.name.replaceAll(" ", "-");

      try {
        await fs.mkdir(folderName);
      } catch (e) {
        throw `A folder named ${folderName} already exists. Rename it, or use the -f flag to specify a different folder name.`;
      }

      process.chdir(folderName);

      // Create template files based on YAML
      const templateFiles = [
        path.join("assets", "icon.png"),
        path.join("src", "index.ts"),
        path.join(".spectral", "index.ts"),
        ".npmrc",
        ".prettierrc",
        ".prettierignore",
        "jest.config.js",
        "package.json",
        "tsconfig.json",
        "webpack.config.js",
      ];

      const { usedComponents } = await writeIntegration(result, registryPrefix);

      await Promise.all([
        ...templateFiles.map((file) =>
          template(
            path.join("yaml", file.endsWith("icon.png") ? file : `${file}.ejs`),
            file,
            context,
          ),
        ),
        writePackageJson(result.name, usedComponents, registryPrefix),
      ]);

      this.log(`
"${folderName}" has been successfully generated based on the provided YAML.
Please run "npm install && npm update --save && npm run format" to prepare your project for development.

For documentation on writing code-native integrations, visit https://prismatic.io/docs/integrations/code-native/
      `);
    } finally {
      process.chdir(cwd);
    }
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateIntegrationFromYAMLCommand.run(toArgv(args), config);
  }
}

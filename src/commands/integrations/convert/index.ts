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
import { formatInputValue } from "../../../generate/formats/writer/yaml/utils.js";
import { kebabCase } from "lodash-es";
import { formatSourceFiles, getFilesToFormat } from "../../../utils/generate.js";

export default class ConvertIntegrationCommand extends Command {
  static description = "Convert a Low-Code Integration's YAML file into a Code Native Integration";
  static flags = {
    yamlFile: Flags.string({
      required: true,
      char: "y",
      description: "Filepath to a Low-Code Integration's YAML",
    }),
    folder: Flags.string({
      required: false,
      char: "f",
      description:
        "Optional: Folder name to install the integration into (kebab-cased integration name by default)",
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
      const { flags } = await this.parse(ConvertIntegrationCommand);
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
          description: result.description ? formatInputValue(result.description) : undefined,
          key: integrationKey,
        },
        registry: {
          url: new URL("/packages/npm", prismaticUrl).toString(),
          scope: "@component-manifests",
        },
      };

      const folderName = folder ?? kebabCase(result.name);

      try {
        await fs.mkdir(folderName);
      } catch (e) {
        throw `A folder named ${folderName} already exists. Rename it, or use the --folder flag to specify a different folder name.`;
      }

      process.chdir(folderName);

      // Create template files based on YAML
      const templateFiles = [
        path.join("assets", "icon.png"),
        path.join(".spectral", "index.ts"),
        path.join(".spectral", "metadata.json"),
        ".npmrc",
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
        writePackageJson(result.name, usedComponents),
      ]);

      const filesToFormat = await getFilesToFormat(folderName);
      await formatSourceFiles(folderName, filesToFormat);

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
    await ConvertIntegrationCommand.run(toArgv(args), config);
  }
}

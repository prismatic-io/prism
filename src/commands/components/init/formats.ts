import { Command, Config, Flags } from "@oclif/core";
import { camelCase } from "lodash-es";
import { template, toArgv, updatePackageJson } from "../../../generate/util.js";
import path, { extname } from "path";
import { copy } from "fs-extra";
import { read } from "../../../generate/formats/readers/openapi/index.js";
import { write } from "../../../generate/formats/writer/index.js";

export default class GenerateFormatsCommand extends Command {
  static hidden = true;
  static description = "Initialize a new Component from a format";
  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the component",
      required: true,
    }),
    icon: Flags.string({
      char: "i",
      description: "Path to png icon for the component",
    }),
    openapi: Flags.string({
      char: "o",
      description: "Path to OpenAPI file for the component",
      required: true,
    }),
    public: Flags.boolean({
      hidden: true,
    }),
  };

  async run() {
    const {
      flags: { name, icon, openapi, public: isPublic = false },
    } = await this.parse(GenerateFormatsCommand);
    const key = camelCase(name);

    const templateFiles = [
      "tsconfig.json",
      "webpack.config.js",
      "jest.config.js",
      path.join("assets", "icon.png"),
    ];
    await Promise.all(templateFiles.map((f) => template(path.join("formats", `${f}.ejs`), f)));

    await updatePackageJson({
      path: "package.json",
      name: isPublic ? `@prismatic-io/${key}` : key,
      private: true,
      version: "0.0.1",
      scripts: {
        build: "webpack",
        "generate:manifest": "npm run build && npx @prismatic-io/spectral component-manifest",
        "generate:manifest:dev":
          "npm run build && npx @prismatic-io/spectral component-manifest --skip-signature-verify",
        test: "jest --runInBand",
        lint: "eslint --quiet --ext .ts .",
        "lint-fix": "eslint --quiet --ext .ts --fix .",
        format: "npm run lint-fix && prettier --log-level error --write .",
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
        "@types/jest": "25.2.3",
        "copy-webpack-plugin": "10.2.4",
        jest: "26.6.3",
        "ts-jest": "26.4.0",
        "ts-loader": "9.3.0",
        typescript: "5.5.3",
        webpack: "5.72.0",
        "webpack-cli": "4.9.2",
        prettier: "3.0.3",
      },
    });

    const result = await read(openapi);
    await write(key, isPublic, result);
    await copy(openapi, `${key}-openapi-spec${extname(openapi)}`);

    if (icon) {
      await copy(icon, path.join("assets", "icon.png"));
    }

    this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-components/writing-custom-components/
    `);
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateFormatsCommand.run(toArgv(args), config);
  }
}

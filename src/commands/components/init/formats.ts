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
    await Promise.all(
      templateFiles.map((f) =>
        template(path.join("formats", f.endsWith("icon.png") ? f : `${f}.ejs`), f),
      ),
    );

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

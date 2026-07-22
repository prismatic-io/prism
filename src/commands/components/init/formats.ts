import { type Config, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { copy } from "fs-extra";
import { camelCase } from "lodash-es";
import path, { extname } from "path";
import { read } from "../../../generate/formats/readers/openapi/index.js";
import { write } from "../../../generate/formats/writer/index.js";
import { template, toArgv } from "../../../generate/util.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default class GenerateFormatsCommand extends PrismaticBaseCommand {
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
    toolchain: Flags.option({
      options: TOOLCHAIN_NAMES,
      default: DEFAULT_TOOLCHAIN,
      hidden: true,
    })(),
  };

  async run() {
    const {
      flags: { name, icon, openapi, public: isPublic = false, toolchain: toolchainName },
    } = await this.parse(GenerateFormatsCommand);
    const toolchain = getToolchain(toolchainName);
    const key = camelCase(name);

    const sharedFiles = [path.join("assets", "icon.png")];
    await Promise.all([
      ...sharedFiles.map((f) =>
        template(path.join("formats", f.endsWith("icon.png") ? f : `${f}.ejs`), f),
      ),
      toolchain.renderTemplates(),
    ]);

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

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
    `);
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateFormatsCommand.run(toArgv(args), config);
  }
}

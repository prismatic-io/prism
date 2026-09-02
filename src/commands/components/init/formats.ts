import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { copy } from "fs-extra";
import { camelCase } from "lodash-es";
import path, { extname } from "path";
import { read } from "../../../generate/formats/readers/openapi/index.js";
import { write } from "../../../generate/formats/writer/index.js";
import { template } from "../../../generate/util.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default defineCommand({
  hidden: true,
  description: "Initialize a new Component from a format",
  options: {
    name: option.string({
      char: "n",
      description: "Name of the component",
      required: true,
    }),
    icon: option.string({
      char: "i",
      description: "Path to png icon for the component",
    }),
    openapi: option.string({
      char: "o",
      description: "Path to OpenAPI file for the component",
      required: true,
    }),
    public: option.boolean({
      hidden: true,
    }),
    toolchain: option.custom({
      options: TOOLCHAIN_NAMES,
      default: DEFAULT_TOOLCHAIN,
      hidden: true,
    })(),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, icon, openapi, public: isPublic = false, toolchain: toolchainName },
    } = commandInput();
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

    commandOutput.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
    `);
  },
});

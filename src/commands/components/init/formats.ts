import { copy } from "fs-extra";
import { z } from "incur";
import { camelCase } from "lodash-es";
import path, { extname } from "path";
import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { read } from "../../../generate/formats/readers/openapi/index.js";
import { write } from "../../../generate/formats/writer/index.js";
import { template } from "../../../generate/util.js";
import { resultOutput, warningsOutput } from "../../../output.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default defineCommand({
  output: z.object({
    name: z.string(),
    path: z.string(),
    toolchain: z.string(),
    ...warningsOutput,
  }),
  hidden: true,
  description: "Initialize a new Component from a format",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("Name of the component")
        .meta({ cli: { char: "n" } }),
      icon: z
        .string()
        .optional()
        .describe("Path to png icon for the component")
        .meta({ cli: { char: "i" } }),
      openapi: z
        .string()
        .describe("Path to OpenAPI file for the component")
        .meta({ cli: { char: "o" } }),
      public: z
        .boolean()
        .optional()
        .meta({ cli: { hidden: true } }),
      toolchain: z
        .enum(TOOLCHAIN_NAMES)
        .default(DEFAULT_TOOLCHAIN)
        .meta({ cli: { hidden: true } }),
    }),
  ),
  async run(context) {
    return resultOutput(context, await generateFormats(context.options));
  },
});

export async function generateFormats(
  options: {
    name: string;
    openapi: string;
    icon?: string;
    public?: boolean;
    toolchain?: "modern" | "legacy";
  },
  directory = process.cwd(),
) {
  const {
    name,
    icon,
    openapi,
    public: isPublic = false,
    toolchain: toolchainName = DEFAULT_TOOLCHAIN,
  } = options;
  const toolchain = getToolchain(toolchainName);
  const key = camelCase(name);

  const sharedFiles = [path.join("assets", "icon.png")];
  await Promise.all([
    ...sharedFiles.map((f) =>
      template(
        path.join("formats", f.endsWith("icon.png") ? f : `${f}.ejs`),
        path.join(directory, f),
      ),
    ),
    toolchain.renderTemplates({}, directory),
  ]);

  const result = await read(openapi);
  await write(key, isPublic, result, directory);
  await copy(openapi, path.join(directory, `${key}-openapi-spec${extname(openapi)}`));

  if (icon) {
    await copy(icon, path.join(directory, "assets", "icon.png"));
  }

  commandOutput.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
    `);
  return { name, path: directory, toolchain: toolchain.name };
}

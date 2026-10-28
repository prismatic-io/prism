import { copy } from "fs-extra";
import { camelCase } from "lodash-es";
import path, { extname } from "path";
import { writeCommandStatus } from "../../../command.js";
import { getWorkingDirectory } from "../../../command-context.js";
import { read } from "../../../generate/formats/readers/openapi/index.js";
import { write } from "../../../generate/formats/writer/index.js";
import { template } from "../../../generate/util.js";
import { DEFAULT_TOOLCHAIN, getToolchain } from "../../../utils/toolchain/index.js";

export async function generateFormats(options: {
  name: string;
  openapi: string;
  icon?: string;
  public?: boolean;
  toolchain?: "modern" | "legacy";
  /** The component key; defaults to the name in camelCase. */
  key?: string;
}): Promise<{
  name: string;
  path: string;
  toolchain: string;
  description: string;
  label: string;
}> {
  const directory = getWorkingDirectory();
  const {
    name,
    icon,
    openapi,
    public: isPublic = false,
    toolchain: toolchainName = DEFAULT_TOOLCHAIN,
  } = options;
  const toolchain = getToolchain(toolchainName);
  const key = options.key ?? camelCase(name);

  const result = await read(openapi);

  const sharedFiles = [path.join("assets", "icon.png")];
  const templateData = { npmPackage: toolchain.name === "modern" };
  await Promise.all([
    ...sharedFiles.map((f) =>
      template(
        path.join("formats", f.endsWith("icon.png") ? f : `${f}.ejs`),
        path.join(directory, f),
      ),
    ),
    toolchain.renderTemplates(templateData),
  ]);

  await write(key, isPublic, result);
  await copy(openapi, path.join(directory, `${key}-openapi-spec${extname(openapi)}`));

  if (icon) {
    await copy(icon, path.join(directory, "assets", "icon.png"));
  }

  writeCommandStatus(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
    `);
  return {
    name,
    path: directory,
    toolchain: toolchain.name,
    description: result.component.display.description,
    label: result.component.display.label,
  };
}

import { promises as fs } from "fs";
import { z } from "incur";
import * as path from "path";
import { parseAndGenerate } from "wsdl-tsclient";
import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { generate } from "../../../generate/index.js";
import { updatePackageJson } from "../../../generate/util.js";
import { resultOutput, warningsOutput } from "../../../output.js";
import { formatSourceFiles, getFilesToFormat, VALID_NAME_REGEX } from "../../../utils/generate.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";
import { generateComponent } from "./component.js";
import { generateFormats } from "./formats.js";

export default defineCommand({
  mutates: true,
  output: z.object({
    name: z.string(),
    path: z.string(),
    toolchain: z.string(),
    ...warningsOutput,
  }),
  description: "Initialize a new Component",
  examples: [
    {
      description:
        "Initialize a new component directory for a component named 'send-customer-invoices':",
      args: { name: "send-customer-invoices" },
    },
    {
      description:
        "Initialize a component from a WSDL definition file, then install dependencies, build, and publish it:",
      args: { name: "Example WSDL" },
      options: { "wsdl-path": "./example.wsdl" },
    },
  ],
  options: optionsSchema(
    z.object({
      "wsdl-path": z
        .string()
        .optional()
        .describe("Path to the WSDL definition file used to generate a Component"),
      "open-api-path": z
        .string()
        .optional()
        .describe(
          "The path to an OpenAPI Specification file (JSON or YAML) used to generate a Component",
        ),
      verbose: z
        .boolean()
        .default(false)
        .describe("Output more verbose logging from Component generation"),
      toolchain: z
        .enum(TOOLCHAIN_NAMES)
        .default(DEFAULT_TOOLCHAIN)
        .describe(
          "Toolchain to scaffold: 'modern' (tsdown + vitest + Biome) or 'legacy' (webpack + jest + eslint)",
        ),
    }),
  ),
  args: argsSchema(
    z.object({
      name: z
        .string()
        .describe(
          "Name of the new component to create (alphanumeric characters, hyphens, and underscores)",
        ),
    }),
  ),
  async run(context) {
    const cwd = process.cwd();

    const {
      args: { name },
      options: {
        verbose,
        "wsdl-path": rawWsdlPath,
        "open-api-path": rawOpenApiPath,
        toolchain: toolchainName,
      },
    } = context;

    const toolchain = getToolchain(toolchainName);
    const wsdlPath = rawWsdlPath ? path.resolve(rawWsdlPath) : undefined;
    const openApiPath = rawOpenApiPath ? path.resolve(rawOpenApiPath) : undefined;

    if (!VALID_NAME_REGEX.test(name)) {
      const regexUrl = new URL("https://regex101.com");
      regexUrl.searchParams.set("regex", VALID_NAME_REGEX.source);
      commandOutput.error(
        `'${name}' contains invalid characters. Please select a component name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See ${regexUrl}`,
        { exit: 1 },
      );
    }
    if (wsdlPath && !wsdlPath?.includes(".wsdl")) {
      commandOutput.error("If a WSDL is provided it must have an extension of '.wsdl'", {
        exit: 1,
      });
    }
    commandOutput.log(`Creating component directory for "${name}"...`);

    const directory = path.resolve(cwd, name);
    await fs.mkdir(directory);

    if (openApiPath) {
      await generateFormats(
        {
          name,
          openapi: openApiPath,
          toolchain: toolchain.name,
        },
        directory,
      );
    } else {
      await generateComponent(
        {
          name,
          description: "Prism-generated Component",
          toolchain: toolchain.name,
        },
        directory,
      );

      if (wsdlPath) {
        const [wsdlName] = path.basename(wsdlPath).split(".wsdl");
        await parseAndGenerate(wsdlPath, directory, {
          caseInsensitiveNames: true,
          quiet: context.agent || !verbose,
        });

        await generate({
          projectRoot: directory,
          projectTemplateName: wsdlName,
          projectTemplatePath: wsdlPath,
        });
      }
    }

    await updatePackageJson({
      path: path.join(directory, "package.json"),
      scripts: {
        build: toolchain.scripts.build,
        publish: "npm run build && prism components:publish",
        "generate:manifest": "npm run build && npx @prismatic-io/spectral component-manifest",
        "generate:manifest:dev":
          "npm run build && npx @prismatic-io/spectral component-manifest --skip-signature-verify",
        test: toolchain.scripts.test,
        lint: toolchain.scripts.lint,
        typecheck: toolchain.scripts.typecheck,
        format: toolchain.scripts.format,
      },
      ...toolchain.packageJson,
      dependencies: {
        "@prismatic-io/spectral": "*",
        ...(wsdlPath ? { soap: "1.1.10" } : {}),
      },
      devDependencies: toolchain.devDependencies,
    });

    const filesToFormat = await getFilesToFormat(path.join(directory, "package.json"));
    await formatSourceFiles(path.join(directory, "package.json"), filesToFormat);

    commandOutput.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
        `);
    return resultOutput(context, { name, path: directory, toolchain: toolchain.name });
  },
});

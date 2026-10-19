import { promises as fs } from "fs";
import { Cli, z } from "incur";
import { camelCase } from "lodash-es";
import * as path from "path";
import { parseAndGenerate } from "wsdl-tsclient";
import { writeCommandStatus } from "../../../command.js";
import { getWorkingDirectory, withWorkingDirectory } from "../../../command-context.js";
import { CommandFailedError } from "../../../errors.js";
import { generate } from "../../../generate/index.js";
import { template, updatePackageJson } from "../../../generate/util.js";
import { hiddenOption } from "../../../hidden-options.js";
import { warningsOutput } from "../../../output.js";
import { COMPONENT_PACKAGE_MARKER } from "../../../utils/component/dependencies.js";
import { formatSourceFiles, getFilesToFormat, VALID_NAME_REGEX } from "../../../utils/generate.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";
import { DEFAULT_COMPONENT_DESCRIPTION, generateComponent } from "./component.js";
import { generateFormats } from "./formats.js";

const NPM_DIST = "npm-dist";
const NPM_MAIN = `./${NPM_DIST}/index.cjs`;
const NPM_TYPES = `./${NPM_DIST}/index.d.cts`;
const SPECTRAL = "@prismatic-io/spectral";
const MINIMUM_SPECTRAL_VERSION = "10.36.0";
const SPECTRAL_RANGE = `^${MINIMUM_SPECTRAL_VERSION}`;

const INTERNAL_SCOPE = "@prismatic-io/components-";
const INTERNAL_REPOSITORY_URL = "git+https://github.com/prismatic-io/components.git";
const INTERNAL_LICENSE = "Apache-2.0";
export default Cli.command({
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
      description: "Initialize a component from a WSDL definition file:",
      args: { name: "example-wsdl" },
      options: { "wsdl-path": "./example.wsdl" },
    },
  ],
  options: z.object({
    "npm-package": z
      .string()
      .optional()
      .describe(
        "Enable npm registry publishing with this package name (for example @your-org/acme); does not make the platform component public",
      ),
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
  args: z.object({
    name: z
      .string()
      .describe(
        "Name of the new component to create (alphanumeric characters, hyphens, and underscores)",
      ),
  }),
  async run(context) {
    const cwd = getWorkingDirectory();

    const {
      args: { name },
      options: {
        verbose,
        "npm-package": npmPackage,
        "wsdl-path": rawWsdlPath,
        "open-api-path": rawOpenApiPath,
        toolchain: toolchainName,
      },
    } = context;

    const internalPublishing = hiddenOption("prismatic-internal");

    const toolchain = getToolchain(toolchainName);
    const wsdlPath = rawWsdlPath ? path.resolve(cwd, rawWsdlPath) : undefined;
    const openApiPath = rawOpenApiPath ? path.resolve(cwd, rawOpenApiPath) : undefined;

    if (!VALID_NAME_REGEX.test(name)) {
      const regexUrl = new URL("https://regex101.com");
      regexUrl.searchParams.set("regex", VALID_NAME_REGEX.source);
      throw new CommandFailedError({
        message: `'${name}' contains invalid characters. Please select a component name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See ${regexUrl}`,
      });
    }
    if (internalPublishing && npmPackage !== undefined) {
      throw new CommandFailedError({
        message: "--npm-package and --prismatic-internal cannot be combined.",
      });
    }
    if ((internalPublishing || npmPackage !== undefined) && !toolchain.npmPackage) {
      throw new CommandFailedError({
        message:
          "npm publishing is supported only by the modern toolchain; use --toolchain modern.",
      });
    }
    if (
      npmPackage !== undefined &&
      (npmPackage.length > 214 ||
        !/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(npmPackage) ||
        ["node_modules", "favicon.ico"].includes(npmPackage))
    ) {
      throw new CommandFailedError({
        message:
          "Invalid --npm-package name. Use a lowercase npm name such as acme or @your-org/acme.",
      });
    }
    if (wsdlPath && !wsdlPath?.includes(".wsdl")) {
      throw new CommandFailedError({
        message: "If a WSDL is provided it must have an extension of '.wsdl'",
      });
    }
    writeCommandStatus(`Creating component directory for "${name}"...`);

    const directory = path.resolve(cwd, name);
    let description = DEFAULT_COMPONENT_DESCRIPTION;
    await fs.mkdir(directory);

    return withWorkingDirectory(directory, async () => {
      if (openApiPath) {
        ({ description } = await generateFormats({
          name,
          openapi: openApiPath,
          toolchain: toolchain.name,
          internalPublishing,
        }));
      } else {
        await generateComponent({
          name,
          description,
          toolchain: toolchain.name,
          internalPublishing,
        });

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

      const packageJsonPath = path.join(directory, "package.json");
      const sharedScripts = {
        test: toolchain.scripts.test,
        lint: toolchain.scripts.lint,
        typecheck: toolchain.scripts.typecheck,
        format: toolchain.scripts.format,
      };
      if (toolchain.npmPackage) {
        // npm names must be lowercase; preserve the directory and display label.
        const packageName = internalPublishing
          ? `${INTERNAL_SCOPE}${camelCase(name).toLowerCase()}`
          : (npmPackage ?? name.toLowerCase());
        const registryPublishing = internalPublishing || npmPackage !== undefined;
        await updatePackageJson({
          path: packageJsonPath,
          name: packageName,
          version: "0.0.1",
          private: true,
          main: NPM_MAIN,
          types: NPM_TYPES,
          exports: { ".": { types: NPM_TYPES, default: NPM_MAIN } },
          ...(internalPublishing
            ? {
                description,
                license: INTERNAL_LICENSE,
                repository: {
                  type: "git",
                  url: INTERNAL_REPOSITORY_URL,
                  directory: `components/${name}`,
                },
                publishConfig: { access: "public" },
              }
            : {}),
          // Ship the platform artifact for publication during CNI import.
          files: [NPM_DIST, "dist"],
          prismatic: COMPONENT_PACKAGE_MARKER,
          scripts: {
            build: toolchain.scripts.build,
            "build:npm": "npm run build && node build-npm.mjs",
            prepare: "npm run build:npm",
            // Avoid npm's `publish` lifecycle hook for platform publication.
            "publish:platform": "npm run build && prism components:publish",
            ...sharedScripts,
          },
          ...toolchain.packageJson,
          dependencies: wsdlPath ? { soap: "1.1.10" } : {},
          // Share the consumer's Spectral execution context through a peer dependency.
          devDependencies: {
            ...toolchain.devDependencies,
            [SPECTRAL]: SPECTRAL_RANGE,
          },
          peerDependencies: { [SPECTRAL]: SPECTRAL_RANGE },
        });
        if (registryPublishing) {
          const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
          delete pkg.private;
          await fs.writeFile(packageJsonPath, JSON.stringify(pkg), "utf-8");
          await updatePackageJson({ path: packageJsonPath });
        }
        await template(path.join("component", "README.md.ejs"), path.join(directory, "README.md"), {
          name: packageName,
          registryPublishing,
          internalPublishing,
        });
      } else {
        await updatePackageJson({
          path: packageJsonPath,
          scripts: {
            build: toolchain.scripts.build,
            publish: "npm run build && prism components:publish",
            ...sharedScripts,
          },
          ...toolchain.packageJson,
          dependencies: {
            [SPECTRAL]: "*",
            ...(wsdlPath ? { soap: "1.1.10" } : {}),
          },
          devDependencies: toolchain.devDependencies,
        });
      }

      const filesToFormat = await getFilesToFormat(path.join(directory, "package.json"));
      await formatSourceFiles(path.join(directory, "package.json"), filesToFormat);

      writeCommandStatus(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"
${toolchain.npmPackage ? 'To build it as an npm package for code-native integrations, run "npm run build:npm"\n' : ""}
For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
        `);
      return { name, path: directory, toolchain: toolchain.name };
    });
  },
});

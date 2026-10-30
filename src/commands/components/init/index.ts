import { promises as fs } from "fs";
import { Cli, z } from "incur";
import { camelCase } from "lodash-es";
import * as path from "path";
import { parseAndGenerate } from "wsdl-tsclient";
import { writeCommandStatus } from "../../../command.js";
import { getWorkingDirectory, withWorkingDirectory } from "../../../command-context.js";
import { CommandFailedError } from "../../../errors.js";
import { generate } from "../../../generate/index.js";
import { templateDirectory, updatePackageJson } from "../../../generate/util.js";
import { hiddenOption } from "../../../hidden-options.js";
import { warningsOutput } from "../../../output.js";
import { formatSourceFiles, getFilesToFormat, VALID_NAME_REGEX } from "../../../utils/generate.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";
import { generateComponent } from "./component.js";
import { generateFormats } from "./formats.js";
import { COMPONENT_TEMPLATE_EXAMPLE } from "./readme.js";

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
    // An internal component keeps the name as given for its key, so the key,
    // directory and package name match, rather than camelCasing it.
    const key = internalPublishing ? name : undefined;

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
    if ((internalPublishing || npmPackage !== undefined) && toolchain.name !== "modern") {
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
    await fs.mkdir(directory);

    return withWorkingDirectory(directory, async () => {
      let description: string;
      // The component's display label: the name, or the spec's title for OpenAPI.
      let label = name;

      if (openApiPath) {
        ({ description, label } = await generateFormats({
          name,
          openapi: openApiPath,
          toolchain: toolchain.name,
          public: internalPublishing,
          key,
        }));
      } else {
        ({ description } = await generateComponent({
          name,
          description: "Prism-generated Component",
          toolchain: toolchain.name,
          public: internalPublishing,
          key,
        }));

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
      if (toolchain.name === "modern") {
        await templateDirectory("npm-package", {
          name,
          packageName: internalPublishing
            ? `@prismatic-io/components-${name.toLowerCase()}`
            : (npmPackage ?? name.toLowerCase()),
          description,
          label,
          importName: camelCase(name),
          internalPublishing,
          registryPublishing: internalPublishing || npmPackage !== undefined,
          toolchain,
          wsdl: Boolean(wsdlPath),
          // Generated components (OpenAPI, WSDL) have their own keys, not the sample's.
          example: openApiPath || wsdlPath ? undefined : COMPONENT_TEMPLATE_EXAMPLE,
        });
        const { dependencies, devDependencies } = JSON.parse(
          await fs.readFile(packageJsonPath, "utf-8"),
        );
        await updatePackageJson({ path: packageJsonPath, dependencies, devDependencies });
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
            "@prismatic-io/spectral": "*",
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

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
        `);
      return { name, path: directory, toolchain: toolchain.name };
    });
  },
});

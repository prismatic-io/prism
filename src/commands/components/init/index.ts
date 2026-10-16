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
import { COMPONENT_TEMPLATE_EXAMPLE, type ReadmeExample } from "./readme.js";

const NPM_DIST = "npm-dist";
// What tsdown.npm.config.mts emits (CommonJS with `fixedExtension`).
const NPM_MAIN = `./${NPM_DIST}/index.cjs`;
const NPM_TYPES = `./${NPM_DIST}/index.d.cts`;
const SPECTRAL = "@prismatic-io/spectral";
const MINIMUM_SPECTRAL_VERSION = "10.36.0";
const SPECTRAL_RANGE = `^${MINIMUM_SPECTRAL_VERSION}`;

/** `--prismatic-internal`: the shape Prismatic's own components are published to npm in. */
const INTERNAL_SCOPE = "@prismatic-io/components-";
const INTERNAL_REPOSITORY_URL = "git+https://github.com/prismatic-io/components.git";
const INTERNAL_LICENSE = "Apache-2.0";
/**
 * With no `private` flag, this is what refuses a stray `npm publish` from a checkout; the
 * publish workflow sets NPM_PUBLISH_OK deliberately.
 */
const INTERNAL_PUBLISH_GUARD =
  "node -e \"if (!process.env.NPM_PUBLISH_OK) { console.error('npm publish runs only from the GitHub publish workflow (NPM_PUBLISH_OK is unset)'); process.exit(1) }\"";

/**
 * Rewrite the scaffold's package.json into the internal, registry-publishable shape:
 * scoped name, metadata npm shows, `publishConfig`, and the publish guard in place of
 * `private`. Keys are written in a fixed order.
 */
const applyInternalPackageShape = async (
  packageJsonPath: string,
  { directory, description }: { directory: string; description: string },
): Promise<void> => {
  // `private` goes (the guard replaces it). The component marker and platform artifact stay:
  // an integration's import loads the artifact to see the component is public and leave it alone.
  const { private: _private, ...pkg } = JSON.parse(
    await fs.readFile(packageJsonPath, "utf-8"),
  ) as Record<string, unknown>;
  const { name: _name, version: _version, main, types, files: _files, scripts, ...rest } = pkg;
  const ordered = {
    // The directory name is already the kebab form the key was derived from; npm scoped names
    // must be lowercase, and the components repo keeps its directories lowercase to match.
    name: `${INTERNAL_SCOPE}${directory.toLowerCase()}`,
    version: "0.0.0",
    description,
    license: INTERNAL_LICENSE,
    repository: {
      type: "git",
      url: INTERNAL_REPOSITORY_URL,
      directory: `components/${directory.toLowerCase()}`,
    },
    main,
    types,
    files: [NPM_DIST, "dist"],
    publishConfig: { access: "public" },
    scripts: {
      ...(scripts as Record<string, string>),
      prepublishOnly: INTERNAL_PUBLISH_GUARD,
    },
    ...rest,
  };
  await fs.writeFile(packageJsonPath, JSON.stringify(ordered), "utf-8");
  // Re-format the file the way every other scaffold write does.
  await updatePackageJson({ path: packageJsonPath });
};

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
        "wsdl-path": rawWsdlPath,
        "open-api-path": rawOpenApiPath,
        toolchain: toolchainName,
      },
    } = context;
    // Hidden (see HIDDEN_OPTIONS): scaffolds one of Prismatic's own components, with the scoped
    // @prismatic-io/components-* name, publishConfig and repository metadata, and the npm
    // publish guard in place of `private`.
    const internal = hiddenOption("prismatic-internal");

    const toolchain = getToolchain(toolchainName, { internal });
    const wsdlPath = rawWsdlPath ? path.resolve(cwd, rawWsdlPath) : undefined;
    const openApiPath = rawOpenApiPath ? path.resolve(cwd, rawOpenApiPath) : undefined;

    if (!VALID_NAME_REGEX.test(name)) {
      const regexUrl = new URL("https://regex101.com");
      regexUrl.searchParams.set("regex", VALID_NAME_REGEX.source);
      throw new CommandFailedError({
        message: `'${name}' contains invalid characters. Please select a component name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See ${regexUrl}`,
      });
    }
    if (internal && !toolchain.npmPackage) {
      throw new CommandFailedError({
        message: `--prismatic-internal scaffolds an npm-publishable component, which only the modern toolchain supports (got --toolchain ${toolchain.name})`,
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
    // What the README's usage example names; the OpenAPI generator reports what it produced.
    let example: ReadmeExample = COMPONENT_TEMPLATE_EXAMPLE;
    await fs.mkdir(directory);

    return withWorkingDirectory(directory, async () => {
      if (openApiPath) {
        ({ description, example } = await generateFormats({
          name,
          openapi: openApiPath,
          toolchain: toolchain.name,
          internal,
        }));
      } else {
        await generateComponent({
          name,
          description,
          toolchain: toolchain.name,
          internal,
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
        // A modern component scaffold is also buildable as an npm package (npm-dist/) so a
        // code-native integration can depend on it, from a registry, a git URL, or a tarball.
        // npm rejects uppercase in new package names; the directory and display label keep
        // the name as typed.
        const packageName = name.toLowerCase();
        await updatePackageJson({
          path: packageJsonPath,
          name: packageName,
          main: NPM_MAIN,
          types: NPM_TYPES,
          // The platform bundle (dist/, with the icon copied in by the build) ships too, so
          // `prism integrations:import` can publish the component from the installed package.
          files: [NPM_DIST, "dist"],
          // How `prism integrations:import` tells component packages from other dependencies.
          prismatic: COMPONENT_PACKAGE_MARKER,
          scripts: {
            build: toolchain.scripts.build,
            "build:npm": "npm run build && tsdown --config tsdown.npm.config.mts",
            // `prepare` is what npm runs before packing, before publishing, and when installing
            // the package from a git URL, so every consumer gets freshly built dist/ and npm-dist/.
            prepare: "npm run build:npm",
            // `publish` is an npm lifecycle hook (it would run after `npm publish`), so the
            // platform publish lives under its own name.
            "publish:platform": "npm run build && prism components:publish",
            ...sharedScripts,
          },
          ...toolchain.packageJson,
          dependencies: wsdlPath ? { soap: "1.1.10" } : {},
          // spectral is a peer dependency so a code-native integration that installs this
          // component as an npm package shares its own copy; the dev pin is what builds and
          // tests the component locally.
          devDependencies: {
            ...toolchain.devDependencies,
            [SPECTRAL]: SPECTRAL_RANGE,
          },
          peerDependencies: { [SPECTRAL]: SPECTRAL_RANGE },
        });
        if (internal) {
          await applyInternalPackageShape(packageJsonPath, { directory: name, description });
        } else {
          // Internal components get the npm page README from their toolchain templates;
          // everyone else gets the guide to depending on the component from a code-native
          // integration.
          await template(
            path.join("component", "README.md.ejs"),
            path.join(directory, "README.md"),
            {
              name: packageName,
              // The local-checkout example points at the directory, which keeps the typed case.
              directory: name,
              key: camelCase(name),
              example,
            },
          );
        }
      } else {
        // Legacy toolchain: the platform-only scaffold, unchanged. It keeps importing
        // spectral's dist/ paths, so it has no need of the release the modern scaffold pins.
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

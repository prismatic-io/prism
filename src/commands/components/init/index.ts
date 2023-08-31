import { Command, Args, Flags } from "@oclif/core";
import { promises as fs } from "fs";
import * as path from "path";
import { parseAndGenerate } from "wsdl-tsclient";
import { Logger as WsdlTsClientLogger } from "wsdl-tsclient/dist/src/utils/logger";
import { generate, updatePackageJson } from "../../../generate/index";
import prettier from "prettier";
import glob from "glob-promise";
import { runGenerator } from "../../../yeoman";

const componentNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/;

const getFilesToFormat = async (basename: string) => {
  return await glob("**/*.ts", {
    ignore: ["**/node_modules/**"],
    cwd: path.dirname(basename),
  });
};

const formatSourceFiles = async (basePath: string, files: string[]) => {
  //format the text of each file
  await Promise.all(
    files.map(async (filePath) => {
      const formattedFile = prettier.format(
        await fs.readFile(
          path.resolve(path.dirname(basePath), filePath),
          "utf-8"
        ),
        { parser: "typescript" }
      );

      //write the formatted text to the proper file location
      await fs.writeFile(
        path.resolve(path.dirname(basePath), filePath),
        formattedFile
      );
    })
  );
};

export default class InitializeComponent extends Command {
  static description = "Initialize a new Component";
  static flags = {
    "wsdl-path": Flags.string({
      required: false,
      description:
        "Path to the WSDL definition file used to generate a Component",
    }),
    "open-api-path": Flags.string({
      required: false,
      description:
        "The path to an OpenAPI Specification file (JSON or YAML) used to generate a Component",
    }),
    verbose: Flags.boolean({
      required: false,
      default: false,
      description: "Output more verbose logging from Component generation",
    }),
  };
  static args = {
    name: Args.string({
      required: true,
      description:
        "Name of the new component to create (alphanumeric characters, hyphens, and underscores)",
    }),
  };

  async run() {
    const {
      args: { name },
      flags: {
        verbose,
        "wsdl-path": rawWsdlPath,
        "open-api-path": rawOpenApiPath,
      },
    } = await this.parse(InitializeComponent);

    const wsdlPath = rawWsdlPath ? path.resolve(rawWsdlPath) : undefined;
    const openApiPath = rawOpenApiPath
      ? path.resolve(rawOpenApiPath)
      : undefined;

    if (!componentNameRegex.test(name)) {
      this.error(
        `'${name}' contains invalid characters. Please select a component name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See https://regex101.com/?regex=${encodeURIComponent(
          componentNameRegex.source
        )}`,
        { exit: 1 }
      );
    }
    if (wsdlPath && !wsdlPath?.includes(".wsdl")) {
      this.error("If a WSDL is provided it must have an extension of '.wsdl'", {
        exit: 1,
      });
    }
    this.log(`Creating component directory for "${name}"...`);

    await fs.mkdir(name);

    const cwd = process.cwd();
    process.chdir(name);

    if (openApiPath) {
      await runGenerator("formats", {
        name,
        openapi: openApiPath,
      });
    } else {
      // Legacy code paths (mostly; keep the component generator call)
      await runGenerator(
        "component",
        process.env.NODE_ENV === "test"
          ? {
              name,
              description: "Prism-generated Component",
              connectionType: "basic",
              skipInstall: true,
            }
          : { name, skipInstall: Boolean(wsdlPath) }
      );
      // Need to pop back as the WSDL generator assumes it's a directory up
      process.chdir(cwd);

      if (wsdlPath) {
        if (!verbose) {
          // wsdl-tsclient emits pretty noisy logs that aren't particularly useful
          WsdlTsClientLogger.disabled();
        }

        const wsdlName = path.basename(wsdlPath).split(".wsdl")[0];
        await parseAndGenerate(wsdlPath, name, {
          caseInsensitiveNames: true,
        });

        await generate({
          projectRoot: name,
          projectTemplateName: wsdlName,
          projectTemplatePath: wsdlPath,
        });

        await updatePackageJson({
          path: path.resolve(name, "package.json"),
          dependencies: { soap: "0.40.0" },
        });

        const filesToFormat = await getFilesToFormat(name);
        await formatSourceFiles(name, filesToFormat);
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
  }
}

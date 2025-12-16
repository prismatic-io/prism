import { promises as fs } from "fs";
import * as path from "path";
import { Args, Command, Flags } from "@oclif/core";
import { parseAndGenerate } from "wsdl-tsclient";
import { Logger as WsdlTsClientLogger } from "wsdl-tsclient/dist/src/utils/logger.js";
import { generate } from "../../../generate/index.js";
import { updatePackageJson } from "../../../generate/util.js";
import { devDependencies } from "../../../utils/devDependencies.js";
import { VALID_NAME_REGEX, formatSourceFiles, getFilesToFormat } from "../../../utils/generate.js";
import GenerateComponentCommand from "./component.js";
import GenerateFormatsCommand from "./formats.js";

export default class InitializeComponent extends Command {
  static description = "Initialize a new Component";

  static examples = [
    {
      description:
        "Initialize a new component directory for a component named 'send-customer-invoices':",
      command: "<%= config.bin %> <%= command.id %> send-customer-invoices",
    },
    {
      description:
        "Initialize a component from a WSDL definition file, then install dependencies, build, and publish it:",
      command: `<%= config.bin %> <%= command.id %> --wsdl-path ./example.wsdl "Example WSDL"
cd "Example WSDL" && yarn install && yarn build
prism components:publish`,
    },
  ];

  static flags = {
    "wsdl-path": Flags.string({
      required: false,
      description: "Path to the WSDL definition file used to generate a Component",
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
    const cwd = process.cwd();

    try {
      const {
        args: { name },
        flags: { verbose, "wsdl-path": rawWsdlPath, "open-api-path": rawOpenApiPath },
      } = await this.parse(InitializeComponent);

      const wsdlPath = rawWsdlPath ? path.resolve(rawWsdlPath) : undefined;
      const openApiPath = rawOpenApiPath ? path.resolve(rawOpenApiPath) : undefined;

      if (!VALID_NAME_REGEX.test(name)) {
        this.error(
          `'${name}' contains invalid characters. Please select a component name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See https://regex101.com/?regex=${encodeURIComponent(
            VALID_NAME_REGEX.source,
          )}`,
          { exit: 1 },
        );
      }
      if (wsdlPath && !wsdlPath?.includes(".wsdl")) {
        this.error("If a WSDL is provided it must have an extension of '.wsdl'", {
          exit: 1,
        });
      }
      this.log(`Creating component directory for "${name}"...`);

      await fs.mkdir(name);
      process.chdir(name);

      if (openApiPath) {
        await GenerateFormatsCommand.invoke(
          {
            name,
            openapi: openApiPath,
          },
          this.config,
        );
      } else {
        await GenerateComponentCommand.invoke(
          {
            name,
            description: "Prism-generated Component",
          },
          this.config,
        );

        // Need to pop back as the WSDL generator assumes it's a directory up
        process.chdir(cwd);

        if (wsdlPath) {
          if (!verbose) {
            // wsdl-tsclient emits pretty noisy logs that aren't particularly useful
            WsdlTsClientLogger.disabled();
          }

          const [wsdlName] = path.basename(wsdlPath).split(".wsdl");
          await parseAndGenerate(wsdlPath, name, {
            caseInsensitiveNames: true,
          });

          await generate({
            projectRoot: name,
            projectTemplateName: wsdlName,
            projectTemplatePath: wsdlPath,
          });
        }
      }

      // Return to new project's directory
      process.chdir(path.join(cwd, name));

      await updatePackageJson({
        path: "package.json",
        scripts: {
          build: "webpack",
          publish: "npm run build && prism components:publish",
          "generate:manifest": "npm run build && npx @prismatic-io/spectral component-manifest",
          "generate:manifest:dev":
            "npm run build && npx @prismatic-io/spectral component-manifest --skip-signature-verify",
          test: "jest",
          lint: "eslint --ext .ts .",
        },
        eslintConfig: {
          root: true,
          extends: ["@prismatic-io/eslint-config-spectral"],
        },
        dependencies: {
          "@prismatic-io/spectral": "*",
          ...(wsdlPath ? { soap: "1.1.10" } : {}),
        },
        devDependencies,
      });

      const filesToFormat = await getFilesToFormat(name);
      await formatSourceFiles(name, filesToFormat);

      this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To test the component, run "npm run test" or "yarn test"
To build the component, run "npm run build" or "yarn build"
To publish the component, run "prism components:publish"

For documentation on writing custom components, visit https://prismatic.io/docs/custom-connectors/
        `);
    } finally {
      process.chdir(cwd);
    }
  }
}

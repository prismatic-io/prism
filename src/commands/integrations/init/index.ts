import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import fs from "fs/promises";
import { camelCase } from "lodash-es";
import path from "path";
import { v4 as uuid4 } from "uuid";
import { template, updatePackageJson } from "../../../generate/util.js";
import { getPrismaticUrl } from "../../../context.js";
import { VALID_NAME_REGEX } from "../../../utils/generate.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

const CLEANABLE_TEMPLATES = [
  "src/client.ts",
  "src/flows.ts",
  "src/flows.test.ts",
  "src/configPages.ts",
];

export default class InitializeIntegration extends PrismaticBaseCommand {
  static description = "Initialize a new Code Native Integration";

  static examples = [
    {
      description: "Initialize a new directory for a Code Native Integration:",
      command: "<%= config.bin %> <%= command.id %> acme-integration",
    },
    {
      description: "Install dependencies:",
      command: "npm install",
    },
    {
      description: "Build the integration:",
      command: "npm run build",
    },
    {
      description: "Import the integration into Prismatic:",
      command: "prism integrations:import",
    },
  ];

  static args = {
    name: Args.string({
      required: true,
      description:
        "Name of the new integration to create (alphanumeric characters, hyphens, and underscores)",
    }),
  };
  static flags = {
    clean: Flags.boolean({
      description: "Generate clean scaffold without example code",
      default: false,
    }),
    toolchain: Flags.option({
      options: TOOLCHAIN_NAMES,
      default: DEFAULT_TOOLCHAIN,
      description:
        "Toolchain to scaffold: 'modern' (tsdown + vitest + Biome) or 'legacy' (webpack + jest + eslint)",
    })(),
  };

  async run() {
    const {
      args: { name },
      flags: { clean, toolchain: toolchainName },
    } = await this.parse(InitializeIntegration);

    const toolchain = getToolchain(toolchainName);

    if (!VALID_NAME_REGEX.test(name)) {
      const regexUrl = new URL("https://regex101.com");
      regexUrl.searchParams.set("regex", VALID_NAME_REGEX.source);
      this.error(
        `'${name}' contains invalid characters. Please select an integration name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See ${regexUrl}`,
        { exit: 1 },
      );
    }

    await fs.mkdir(name);
    process.chdir(name);

    const registryUrl = new URL("/packages/npm", await getPrismaticUrl()).toString();
    const context = {
      integration: { name, description: "Prism-generated Integration", key: camelCase(name) },
      flow: {
        stableKey: uuid4(),
      },
      configVars: {
        connection: {
          stableKey: uuid4(),
        },
        dataSource: {
          stableKey: uuid4(),
        },
      },
      registry: {
        url: registryUrl,
        scope: "@component-manifests",
      },
    };

    const templateSuffix = clean ? ".clean" : "";
    const resolveTemplateSource = (file: string): string => {
      if (file.endsWith("icon.png")) {
        return file;
      }
      if (CLEANABLE_TEMPLATES.includes(file)) {
        return `${file}${templateSuffix}.ejs`;
      }
      return `${file}.ejs`;
    };

    const sharedFiles = [
      path.join("assets", "icon.png"),
      path.join("src", "index.ts"),
      path.join("src", "client.ts"),
      path.join("src", "flows.ts"),
      path.join("src", "flows.test.ts"),
      path.join("src", "configPages.ts"),
      path.join("src", "componentRegistry.ts"),
      path.join("src", "markdown.d.ts"),
      path.join(".spectral", "index.ts"),
      ".env.testing",
      ".npmrc",
      "documentation.md",
      "package.json",
    ];
    await Promise.all([
      ...sharedFiles.map((file) =>
        template(path.join("integration", resolveTemplateSource(file)), file, context),
      ),
      toolchain.renderTemplates(context),
    ]);

    await updatePackageJson({
      path: "package.json",
      scripts: {
        build: toolchain.scripts.build,
        import: "npm run build && prism integrations:import",
        test: toolchain.scripts.test,
        lint: toolchain.scripts.lint,
        typecheck: toolchain.scripts.typecheck,
        format: toolchain.scripts.format,
      },
      ...toolchain.packageJson,
      dependencies: {
        "@prismatic-io/spectral": "*",
      },
      devDependencies: toolchain.devDependencies,
    });

    this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To run unit tests for the integration, run "npm run test" or "yarn test"
To build the integration, run "npm run build" or "yarn build"
To import the integration, run "prism integrations:import"

For documentation on writing code-native integrations, visit https://prismatic.io/docs/integrations/code-native/
    `);
  }
}

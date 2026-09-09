import fs from "fs/promises";
import { z, Cli, Errors } from "incur";
import { camelCase } from "lodash-es";
import path from "path";
import { v4 as uuid4 } from "uuid";
import { writeCommandStatus } from "../../../command.js";
import { getPrismaticUrl } from "../../../context.js";
import { template, updatePackageJson } from "../../../generate/util.js";
import { warningsOutput } from "../../../output.js";
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

export default Cli.command({
  output: z.object({
    name: z.string(),
    path: z.string(),
    toolchain: z.string(),
    ...warningsOutput,
  }),
  description: "Initialize a new Code Native Integration",
  examples: [
    {
      description: "Initialize a new directory for a Code Native Integration:",
      args: { name: "acme-integration" },
    },
    { description: "Install dependencies:", args: { name: "npm" } },
    { description: "Build the integration:", args: { name: "npm" } },
    { description: "Import the integration into Prismatic:" },
  ],
  args: z.object({
    name: z
      .string()
      .describe(
        "Name of the new integration to create (alphanumeric characters, hyphens, and underscores)",
      ),
  }),
  options: z.object({
    clean: z.boolean().default(false).describe("Generate clean scaffold without example code"),
    toolchain: z
      .enum(TOOLCHAIN_NAMES)
      .default(DEFAULT_TOOLCHAIN)
      .describe(
        "Toolchain to scaffold: 'modern' (tsdown + vitest + Biome) or 'legacy' (webpack + jest + eslint)",
      ),
  }),
  async run(context) {
    const {
      args: { name },
      options: { clean, toolchain: toolchainName },
    } = context;

    const toolchain = getToolchain(toolchainName);

    if (!VALID_NAME_REGEX.test(name)) {
      const regexUrl = new URL("https://regex101.com");
      regexUrl.searchParams.set("regex", VALID_NAME_REGEX.source);
      throw new Errors.IncurError({
        code: "COMMAND_FAILED",
        message: `'${name}' contains invalid characters. Please select an integration name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See ${regexUrl}`,
        exitCode: 1,
      });
    }

    const directory = path.resolve(name);
    await fs.mkdir(directory);

    const registryUrl = new URL("/packages/npm", await getPrismaticUrl()).toString();
    const templateContext = {
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
      const normalizedFile = file.split(path.sep).join("/");
      if (CLEANABLE_TEMPLATES.includes(normalizedFile)) {
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
        template(
          path.join("integration", resolveTemplateSource(file)),
          path.join(directory, file),
          templateContext,
        ),
      ),
      toolchain.renderTemplates(templateContext, directory),
    ]);

    await updatePackageJson({
      path: path.join(directory, "package.json"),
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

    writeCommandStatus(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To run unit tests for the integration, run "npm run test" or "yarn test"
To build the integration, run "npm run build" or "yarn build"
To import the integration, run "prism integrations:import"

For documentation on writing code-native integrations, visit https://prismatic.io/docs/integrations/code-native/
    `);
    return { name, path: directory, toolchain: toolchain.name };
  },
});

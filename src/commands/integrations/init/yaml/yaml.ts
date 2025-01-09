import { Command, Config, Flags } from "@oclif/core";
import path from "path";
import { template, toArgv, updatePackageJson } from "../../../../generate/util.js";
import { exists } from "../../../../fs.js";
import { promises as fs } from "fs";
import { load } from "js-yaml";
import { v4 as uuid4 } from "uuid";
import { prismaticUrl } from "../../../../auth.js";
import { gql, gqlRequest } from "../../../../graphql.js";
import { camelCase, kebabCase, xor } from "lodash-es";
import {
  ActionObjectFromYAML,
  ConfigPageObjectFromYAML,
  ConfigVarObjectFromYAML,
  FlowObjectFromYAML,
  IntegrationObjectFromYAML,
} from "./types.js";
import {
  createBranchString,
  createFlowInputsString,
  createLoopString,
  determinePermissionAndVisibilityType,
  formatConfigVarInputs,
} from "./utils.js";

export default class GenerateIntegrationFromYAMLCommand extends Command {
  static description = "Initialize a new Code Native Integration based on a YAML file";
  static flags = {
    yamlFile: Flags.string({
      required: true,
      char: "f",
      description: "YAML filepath",
    }),
    registryPrefix: Flags.string({
      required: false,
      char: "r",
      description: "Optional: Your custom NPM registry prefix",
    }),
  };

  async run() {
    const cwd = process.cwd();

    try {
      const { flags } = await this.parse(GenerateIntegrationFromYAMLCommand);
      const { yamlFile, registryPrefix } = flags;

      const yamlExists = await exists(yamlFile);

      if (!yamlExists) {
        this.error("Could not find a YAML file at the given filepath.");
      }

      const result = load(await fs.readFile(yamlFile, "utf-8")) as IntegrationObjectFromYAML;

      const integrationKey = uuid4();

      const context = {
        integration: {
          name: result.name,
          description: result.description,
          key: integrationKey,
        },
        registry: {
          url: new URL("/packages/npm", prismaticUrl).toString(),
          scope: "@component-manifests",
        },
      };

      // @TODO - prompt for a folder name
      const folderName = result.name.replaceAll(" ", "-");
      await fs.mkdir(folderName);
      process.chdir(folderName);

      // Create template files based on YAML
      const templateFiles = [
        path.join("assets", "icon.png"),
        path.join("src", "index.ts"),
        path.join("src", "client.ts"),
        path.join(".spectral", "index.ts"),
        path.join("src", "flows", "index.ts"),
        ".npmrc",
        ".prettierrc",
        ".prettierignore",
        "jest.config.js",
        "package.json",
        "tsconfig.json",
        "webpack.config.js",
      ];

      const ejsUtils = { camelCase, kebabCase };

      const usedComponents = await extractComponentList(result.flows);

      await Promise.all([
        ...templateFiles.map((file) =>
          template(
            path.join("integration", file.endsWith("icon.png") ? file : `${file}.ejs`),
            file,
            context,
          ),
        ),
        ...result.flows.map(async (flow) => {
          this.log("Converting Flow: ", flow.name);
          const ejsInputs = formatFlowForEJS(flow);

          template("integration/src/flows/flow.ts.ejs", `src/flows/${kebabCase(flow.name)}.ts`, {
            ...ejsInputs,
            utils: ejsUtils,
          });
        }),
        Promise.resolve(
          (async () => {
            this.log("Converting config pages & required config vars...");
            const ejsInputs = formatConfigPageForEJS(
              result.configPages || [],
              result.requiredConfigVars,
            );

            template("integration/src/configPages.ts.ejs", "src/configPages.ts", {
              pages: ejsInputs,
              utils: ejsUtils,
            });
          })(),
        ),
        Promise.resolve(
          (async () => {
            this.log("Creating the component manifest...");

            template("integration/src/componentRegistry.ts.ejs", "src/componentRegistry.ts", {
              components: usedComponents,
              customPrefix: registryPrefix ?? "@FIXME-YOUR-CUSTOM-NPM-REGISTRY",
              utils: ejsUtils,
            });
          })(),
        ),
        // template("integration/src/flows/index.ts.ejs", "flows/index.ts"),
      ]);

      const packageJsonManifests: Record<string, string> = {};

      usedComponents.public.forEach((componentKey) => {
        const packageName = `@component-manifests/${componentKey}`;
        packageJsonManifests[packageName] = "*";
      });

      usedComponents.private.forEach((componentKey) => {
        const packageName = `${
          registryPrefix ?? "@FIXME-YOUR-CUSTOM-NPM-REGISTRY"
        }/${componentKey}`;
        packageJsonManifests[packageName] = "*";
      });

      await updatePackageJson({
        path: "package.json",
        scripts: {
          build: "webpack",
          import: "npm run build && prism integrations:import",
          test: "jest",
          lint: "eslint --ext .ts .",
          "lint-fix": "eslint --fix --quiet --ext .ts .",
          format: "prettier . --write",
        },
        eslintConfig: {
          root: true,
          extends: ["@prismatic-io/eslint-config-spectral"],
        },
        dependencies: {
          "@prismatic-io/spectral": "*",
        },
        devDependencies: {
          ...packageJsonManifests,
          "@prismatic-io/eslint-config-spectral": "2.0.1",
          "@types/jest": "29.5.12",
          "copy-webpack-plugin": "12.0.2",
          jest: "29.7.0",
          prettier: "3.4.2",
          "ts-jest": "29.1.2",
          "ts-loader": "9.5.1",
          typescript: "5.5.3",
          webpack: "5.91.0",
          "webpack-cli": "5.1.4",
        },
      });
    } finally {
      process.chdir(cwd);
    }
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await GenerateIntegrationFromYAMLCommand.run(toArgv(args), config);
  }
}

function formatFlowForEJS(flow: FlowObjectFromYAML) {
  const { name, description, isSynchronous, endpointSecurityType } = flow;
  const steps: Array<ActionObjectFromYAML> = [];
  let formattedStep: ActionObjectFromYAML;
  let trigger: ActionObjectFromYAML | undefined;
  const includes = {
    branch: false,
  };

  flow.steps.forEach((step) => {
    formattedStep = step;

    if (step.action.component.key === "loop") {
      formattedStep.loopString = createLoopString(formattedStep, trigger);
    } else if (step.action.component.key === "branch") {
      formattedStep.branchString = createBranchString(formattedStep, trigger);
      includes.branch = true;
    } else {
      formattedStep.formattedInputs = createFlowInputsString(step, trigger);
    }

    if (step.isTrigger) {
      trigger = formattedStep;
    } else {
      steps.push(formattedStep);
    }
  });

  if (!trigger) {
    // @TODO - we can maybe make this more forgiving
    throw "No trigger found on flow.";
  }

  return {
    key: camelCase(name),
    includes,
    flow: {
      name,
      stableKey: kebabCase(name),
      description,
      isSynchronous,
      endpointSecurityType,
    },
    trigger,
    steps,
  };
}

function formatConfigPageForEJS(
  configPages: Array<ConfigPageObjectFromYAML>,
  requiredConfigVars: Array<ConfigVarObjectFromYAML>,
) {
  return configPages.map((configPage) => {
    const { name, tagline, elements } = configPage;
    const configVars = elements.map((element) => {
      const foundConfigVar = requiredConfigVars.find((configVar) => {
        return configVar.key === element.value;
      });

      if (!foundConfigVar) {
        throw "TODO: Error finding config var";
      }

      return {
        name: element.value,
        ...foundConfigVar,
        inputs: formatConfigVarInputs(foundConfigVar),
        meta: {
          ...foundConfigVar.meta,
          permissionAndVisibilityType: determinePermissionAndVisibilityType(
            foundConfigVar.meta,
            foundConfigVar.orgOnly,
          ),
        },
      };
    });

    return {
      name,
      tagline,
      configVars,
    };
  });
}

/* Returns of map of component names and a boolean denoting if the component is public. */
async function extractComponentList(flows: Array<FlowObjectFromYAML>) {
  const componentMap: Record<string, boolean> = {};

  flows.forEach((flow) => {
    flow.steps.forEach((step) => {
      const key = step.action.component.key;
      if (!componentMap[key]) {
        componentMap[key] = true;
      }
    });
  });

  const componentKeys = Object.keys(componentMap);

  const response = await gqlRequest({
    document: gql`
      query getPublicComponents($componentKeys: [String]) {
        components(public: true, key_In: $componentKeys) {
          nodes {
            key
          }
        }
      }
    `,
    variables: {
      componentKeys,
    },
  });

  const publicComponents: Array<string> = response.components.nodes.map(
    (node: { key: string }) => node.key,
  );
  const privateComponents: Array<string> = xor(publicComponents, componentKeys);

  return {
    public: publicComponents,
    private: privateComponents,
  };
}

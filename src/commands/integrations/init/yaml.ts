import { Command, Config, Flags } from "@oclif/core";
import path from "path";
import { template, toArgv, updatePackageJson } from "../../../generate/util.js";
import { exists } from "../../../fs.js";
import { promises as fs } from "fs";
import { load } from "js-yaml";
import { v4 as uuid4 } from "uuid";
import { prismaticUrl } from "../../../auth.js";
import { camelCase, kebabCase } from "lodash-es";

type ValidComplexYAMLValue = Array<{
  type: string;
  value: ValidYAMLValue;
  name?: {
    type: string;
    value: ValidYAMLValue;
  };
}>;
type ValidYAMLValue = string | string[] | number | boolean;

type ComponentObjectFromYAML = {
  isPublic: boolean;
  key: string;
  version: number;
};

type ActionObjectFromYAML = {
  action: {
    component: ComponentObjectFromYAML;
    key: string;
  };
  description: string;
  inputs: Record<
    string,
    {
      type: string;
      value: ValidYAMLValue | ValidComplexYAMLValue;
    }
  >;
  formattedInputs?: string;
  isTrigger: boolean;
  name: string;
  steps?: Array<ActionObjectFromYAML>;
};

type ConfigPageObjectFromYAML = {
  name: string;
  tagline?: string;
  elements: Array<{
    type: string;
    value: string;
  }>;
  // @TODO - what does this map to
  userLevelConfigured?: boolean;
};

type ConfigVarObjectFromYAML = {
  dataType: string;
  defaultValue?: string;
  description?: string;
  key: string;
  orgOnly?: boolean;
  collectionType?: string;
  connection?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    dataType: string;
  };
  dataSource?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    dataType: string;
  };
  inputs?: Record<
    string,
    {
      type: string;
      value: string;
      meta: {
        visibleToOrgDeployer: boolean;
        visibleToCustomerDeployer: boolean;
        orgOnly: boolean;
      };
    }
  >;
  meta: {
    visibleToOrgDeployer: boolean;
    visibleToCustomerDeployer: boolean;
    orgOnly?: boolean;
  };
};

type FlowObjectFromYAML = {
  endpointSecurityType: string;
  isSynchronous: boolean;
  name: string;
  description: string;
  steps: Array<ActionObjectFromYAML>;
};

type IntegrationObjectFromYAML = {
  name: string;
  description: string;
  flows: Array<FlowObjectFromYAML>;
  configPages: Array<{
    elements: Array<{
      type: string;
      value: string;
    }>;
    name: string;
    tagline?: string;
    userLeveLConfigured: boolean;
  }>;
  requiredConfigVars: Array<ConfigVarObjectFromYAML>;
};

function wrapValue(value: ValidYAMLValue) {
  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  } else {
    return `"${value}"`;
  }
}

export default class GenerateIntegrationFromYAMLCommand extends Command {
  static description = "Initialize a new Code Native Integration based on a YAML file";
  static flags = {
    yamlFile: Flags.string({
      required: true,
      char: "f",
      description: "YAML filepath",
    }),
  };

  async run() {
    const cwd = process.cwd();

    try {
      const { flags } = await this.parse(GenerateIntegrationFromYAMLCommand);
      const yamlExists = await exists(flags.yamlFile);

      if (!yamlExists) {
        this.error("Could not find a YAML file at the given filepath.");
      }

      // @TODO - type
      // read yaml
      const result = load(await fs.readFile(flags.yamlFile, "utf-8")) as IntegrationObjectFromYAML;

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
        path.join("src", "componentRegistry.ts"),
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

      const ejsUtils = { camelCase };

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
        Promise.resolve(() => {
          this.log("Converting config pages & required config vars...");
          const ejsInputs = formatConfigPageForEJS(result.configPages || [], result.requiredConfigVars);

          template("integration/src/configPages.ts.ejs", "src/configPages.ts", {
            pages: ejsInputs,
            utils: ejsUtils,
          });
        }),
        // template("integration/src/flows/index.ts.ejs", "flows/index.ts"),
      ]);

      // @TODO: update dependencies with component manifests...
      // this may be weird when it comes to custom components?
      await updatePackageJson({
        // @TODO - name formatting
        path: "package.json",
        scripts: {
          build: "webpack",
          import: "npm run build && prism integrations:import",
          test: "jest",
          lint: "eslint --ext .ts .",
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

export function createFlowInputsString(action: ActionObjectFromYAML): string {
  const inputs = action.inputs ?? {};
  let resultString = "";

  Object.entries(inputs).forEach(([key, input]) => {
    let currentInputString = "";

    if (input.type === "complex") {
      let shouldWrap = true;
      let isObject = false;

      const castInputs = input.value as ValidComplexYAMLValue;
      if (!castInputs || castInputs.length === 0) {
        shouldWrap = false;
        currentInputString = `${JSON.stringify(input.value)},`;
      } else {
        castInputs.forEach((element) => {
          if (element.name) {
            isObject = true;
            currentInputString += `${element.name.value}: ${wrapValue(element.value)},`;
          } else {
            currentInputString += `${wrapValue(element.value)},`;
          }
        });
      }

      if (shouldWrap) {
        currentInputString = isObject ? `{${currentInputString}},` : `[${currentInputString}],`;
      }
    } else {
      currentInputString += `${wrapValue(input.value as ValidYAMLValue)},`;
    }

    if (action.isTrigger) {
      resultString += `\n${key}: { value: ${currentInputString} },`;
    } else {
      resultString += `\n${key}: ${currentInputString}`;
    }
  });

  return resultString;
}

function formatFlowForEJS(flow: FlowObjectFromYAML) {
  const { name, description, isSynchronous, endpointSecurityType } = flow;
  const steps: Array<ActionObjectFromYAML> = [];
  let trigger: ActionObjectFromYAML | undefined;

  flow.steps.forEach((step) => {
    step.formattedInputs = createFlowInputsString(step);

    if (step.isTrigger) {
      trigger = step;
    } else {
      steps.push(step);
    }
  });

  if (!trigger) {
    // @TODO - we can maybe make this more forgiving
    throw "No trigger found on flow.";
  }

  return {
    key: camelCase(name),
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

function determinePermissionAndVisibilityType(
  meta: ConfigVarObjectFromYAML["meta"],
  orgOnly?: boolean,
) {
  const { visibleToCustomerDeployer, visibleToOrgDeployer } = meta;
  const isOrgOnly = orgOnly || meta.orgOnly;

  if (visibleToCustomerDeployer) {
    return "customer";
  } else if (isOrgOnly) {
    return "organization";
  } else if (visibleToOrgDeployer && !visibleToCustomerDeployer && !isOrgOnly) {
    return "embedded";
  }

  // @TODO: What is the default?
  return "customer";
}

function formatConfigVarInputs(configVar: ConfigVarObjectFromYAML) {
  return Object.entries(configVar.inputs || []).map(([key, input]) => {
    return {
      name: key,
      type: input.type,
      value: input.value,
      meta: {
        ...input.meta,
        permissionAndVisibilityType: determinePermissionAndVisibilityType(input.meta),
      },
    };
  });
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

import { Command, Config, Flags } from "@oclif/core";
import path from "path";
import { template, toArgv, updatePackageJson } from "../../../generate/util.js";
import { exists } from "../../../fs.js";
import { promises as fs } from "fs";
import { load } from "js-yaml";
import { v4 as uuid4 } from "uuid";
import { prismaticUrl } from "../../../auth.js";
import { camelCase, kebabCase } from "lodash-es";
import {
  ActionObjectFromYAML,
  ConfigPageObjectFromYAML,
  ConfigVarObjectFromYAML,
  FlowObjectFromYAML,
  IntegrationObjectFromYAML,
  ValidComplexYAMLValue,
  ValidYAMLValue,
} from "./types.js";
import { ConditionalExpression } from "@prismatic-io/spectral";

function wrapValue(value: ValidYAMLValue, isMultiline?: boolean) {
  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  } else if (typeof value === "string" && isMultiline) {
    const escapedValue = value.replace(/`/g, "\\`");
    return `\`${escapedValue}\``;
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

function convertYAMLReferenceValue(
  refValue: string,
  trigger?: ActionObjectFromYAML,
  isLoopItem?: boolean,
) {
  const valuePath = refValue.split(".");
  const [stepName, _resultsKey, ...rest] = valuePath;
  let suffix = "";

  rest.forEach((term) => {
    const parsed = Number.parseInt(term);
    const formattedTerm =
      typeof parsed === "number" && !Number.isNaN(parsed) ? `[${term}]` : `.${term}`;
    suffix += formattedTerm;
  });

  if (trigger && stepName === camelCase(trigger.name)) {
    return `params.onTrigger.results${suffix}`;
  } else if (isLoopItem) {
    return `${stepName}Item${suffix}`;
  } else {
    return `${stepName}.data${suffix}`;
  }
}

export function createFlowInputsString(
  action: ActionObjectFromYAML,
  trigger?: ActionObjectFromYAML,
  isLoopItem?: boolean,
): string {
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
            currentInputString += `${
              typeof element.name === "string" ? element.name : element.name.value
            }: ${wrapValue(element.value as string)},`;
          } else {
            currentInputString += `${wrapValue(element.value as string)},`;
          }
        });
      }

      if (shouldWrap) {
        currentInputString = isObject ? `{${currentInputString}},` : `[${currentInputString}],`;
      }
    } else if (input.type === "reference") {
      currentInputString += `${convertYAMLReferenceValue(
        input.value as string,
        trigger,
        isLoopItem,
      )},`;
    } else if (input.type === "configVar") {
      currentInputString += `configVars["${input.value}"],`;
    } else {
      if (typeof input.value === "string" && input.value.indexOf("\n") >= 0) {
        currentInputString += `${wrapValue(input.value as ValidYAMLValue, true)},`;
      } else {
        currentInputString += `${wrapValue(input.value as ValidYAMLValue)},`;
      }
    }

    if (action.isTrigger) {
      resultString += `\n${key}: { value: ${currentInputString} },`;
    } else {
      resultString += `\n${key}: ${currentInputString}`;
    }
  });

  return resultString;
}
function createLoopString(step: ActionObjectFromYAML, trigger?: ActionObjectFromYAML) {
  const loopStepName = camelCase(step.name);
  let loopString = `const ${loopStepName}: { data: Array<unknown> } = { data: [] };\n`;

  // @TODO - handle break loop action

  if (step.action.key === "loopOverItems") {
    const items = step.inputs.items;
    let convertedRef: string;
    switch (items.type) {
      case "reference":
        convertedRef = convertYAMLReferenceValue(items.value as string, trigger);
        loopString += `for (const ${loopStepName}Item of ${convertedRef}) {`;
        break;
      case "configVar":
        loopString += `for (const ${loopStepName}Item of configVars["${items.value}"]) {`;
        break;
      default:
        // If you attempt to do this via the UI, you run into an error in the test runner.
        console.log("error step", step, items.type);
        throw "We do not support looping over string values or templates.";
    }
  } else if (step.action.key === "loopNTimes") {
    const iterationCount = Number.parseInt(step.inputs.iterationCount.value as string);
    loopString += `for (let ${loopStepName}Idx = 0; ${loopStepName}Idx < ${iterationCount}; ${loopStepName}Idx++) {`;
  } else {
    throw `Cannot generate loop code for a non-loop step: ${step.name}`;
  }

  (step.steps || []).forEach((loopStep) => {
    if (loopStep.action.component.key === "loop") {
      loopString += createLoopString(loopStep, trigger);
    } else if (loopStep.action.component.key === "branch") {
      loopString += createBranchString(loopStep, trigger);
    } else {
      loopString += `
        const ${camelCase(loopStep.name)} = await context.components.${camelCase(
          step.action.component.key,
        )}.${step.action.key}({
          ${createFlowInputsString(loopStep, trigger, true)}
        });
      `;
    }
  });

  const lastStep = (step.steps || []).at(-1) ?? { name: "" };

  loopString += `
    // Setting the output of the loop to the result of its last step.
    ${loopStepName}.data.push(${camelCase(lastStep.name)});
  }`;

  return loopString;
}

function convertObjToExpression(obj: { type: string; value: string }) {
  const { type, value } = obj;

  switch (type) {
    case "configVar":
      return `configVars["${value}"]`;
    case "value":
      if (!Number.isNaN(Number.parseInt(value))) {
        return Number.parseInt(value);
      } else {
        return `"${value}"`;
      }
    default:
      // @TODO
      throw "Invalid expression object.";
  }
}

function convertBranchInputs(inputs: ValidComplexYAMLValue) {
  const result: Array<unknown> = [];

  inputs.forEach((input, i) => {
    if (typeof input === "string") {
      result.push(`"${input}"`);
    } else if (Array.isArray(input)) {
      result.push(convertBranchInputs(input));
    } else {
      result.push(convertObjToExpression(input as { name: string; type: string; value: string }));
    }
  });

  return result;
}

function stringifyCondition(input: Array<unknown>) {
  let resultString = "[";

  input.forEach((clause, i) => {
    if (Array.isArray(clause)) {
      resultString += stringifyCondition(clause);
    } else {
      resultString += clause;
    }

    resultString += ",";
  });

  return `${resultString}]`;
}

function createBranchString(step: ActionObjectFromYAML, trigger?: ActionObjectFromYAML) {
  const branchStepName = camelCase(step.name);

  let branchString = `
    let ${branchStepName} = 'Else';
  `;
  const inputConditions = step.inputs.conditions.value as ValidComplexYAMLValue;

  inputConditions.forEach((condition, i) => {
    const ifStatement = i === 0 ? "if" : "else if";
    branchString += `
      ${ifStatement} (evaluate(${stringifyCondition(
        convertBranchInputs(condition.value as ValidComplexYAMLValue),
      )})) {
        ${branchStepName} = "${condition.name}";
      }
    `;
  });

  const branchSteps = step.branches ?? [];

  branchSteps.forEach((branch, i) => {
    branchString += `if (${branchStepName} === "${branch.name}") {`;

    branch.steps.forEach((step, i) => {
      if (step.action.component.key === "loop") {
        branchString += createLoopString(step, trigger);
      } else if (step.action.component.key === "branch") {
        branchString += createBranchString(step, trigger);
      } else {
        branchString += `
          const ${camelCase(step.name)} = await context.components.${camelCase(
            step.action.component.key,
          )}.${step.action.key}({
            ${createFlowInputsString(step, trigger)}
          });
        `;
      }
    });

    branchString += "}";
  });

  return branchString;
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

function determinePermissionAndVisibilityType(
  meta: ConfigVarObjectFromYAML["meta"],
  orgOnly?: boolean,
) {
  const { visibleToCustomerDeployer, visibleToOrgDeployer } = meta ?? {};
  const isOrgOnly = orgOnly || meta?.orgOnly;

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

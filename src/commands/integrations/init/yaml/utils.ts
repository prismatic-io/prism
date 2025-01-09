import { camelCase } from "lodash-es";
import {
  ActionObjectFromYAML,
  ConfigVarObjectFromYAML,
  ValidComplexYAMLValue,
  ValidYAMLValue,
} from "./types.js";

/* Given a valid YAML value, wrap it in quotes, escaped backticks,
 * or nothing depending on the case. */
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

/* Convert a YAML reference path into one that will work in CNI code. Examples:
 *   myAction.results.1 => myAction.data[1]
 *   myTriggerStepName.results => params.onTrigger.results */
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

/* Given a config var's meta & orgOnly properties, determine the
 * permission and visibility type. Implementation taken from frontend. */
export const getPermissionAndVisibilityType = (
  meta: ConfigVarObjectFromYAML["meta"],
  orgOnly?: boolean,
) => {
  const { visibleToCustomerDeployer } = meta ?? {};

  if (orgOnly) {
    return "organization";
  }

  if (visibleToCustomerDeployer) {
    return "customer";
  }

  return "embedded";
};

/* Given a template input, convert it into a string that can be used in the
 * EJS file.
 *
 * from: Hello this is my template: {{#My Var}}, and {{$myAction.results.testKey}}
 * into: `Hello this is my template: ${configVars["My Var"]}, and ${myAction.data.testKey}`
 */
const CONFIG_VAR_REGEX = /\{{#(.*?)\}}/g;
const STEP_REF_REGEX = /\{{\$(.*?)\}}/g;

function convertTemplateInput(input: string) {
  let resultString = input.replace(CONFIG_VAR_REGEX, '$${configVars["$1"]}');
  resultString = resultString.replace(STEP_REF_REGEX, "$${$1}");

  return `\`${resultString}\``;
}

/* Flows: Given a flow action step, convert its inputs into a CNI-compatible string
 * that will then be included in the EJS file. */
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
    } else if (input.type === "template") {
      currentInputString += `${convertTemplateInput(input.value as string)},`;
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

/* Loop helper: Determines if a step is actually a loop step vs. a break loop */
function getLoopKind(step: ActionObjectFromYAML) {
  if (step.action.component.key === "loop") {
    return step.action.key === "breakLoop" ? "breakLoop" : "loop";
  }
  return "";
}

/* Loop: Given a loop step, convert it into a string that can
 * be included in the EJS file. */
export function createLoopString(step: ActionObjectFromYAML, trigger?: ActionObjectFromYAML) {
  const loopStepName = camelCase(step.name);
  let loopString = `const ${loopStepName}: { data: Array<unknown> } = { data: [] };\n`;
  const isBreakLoop = getLoopKind(step) === "breakLoop";

  if (isBreakLoop) {
    return "break;\n";
  }

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

  (step.steps || []).some((childStep) => {
    if (getLoopKind(childStep) === "loop") {
      loopString += createLoopString(childStep, trigger);
    } else if (childStep.action.component.key === "branch") {
      loopString += createBranchString(childStep, trigger);
    } else {
      loopString += `
        const ${camelCase(childStep.name)} = await context.components.${camelCase(
          step.action.component.key,
        )}.${step.action.key}({
          ${createFlowInputsString(childStep, trigger, true)}
        });
      `;
    }
  });

  const lastStep = (step.steps || []).at(-1) ?? { name: "" };

  loopString += `
    ${loopStepName}.data.push(${camelCase(lastStep.name)});
  }`;

  return loopString;
}

/* Branch helper: Given an object that represents a conditional expression, convert
 * it into a string that can be included in the result of convertBranchInputs. */
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
    case "template":
      return convertTemplateInput(value);
    default:
      return `"FIXME - The converter ran into an error when attemping to parse this value."`;
  }
}

/* Branch helper: Given a branch step's inputs, convert it into a condition expression,
 * e.g. ["and", ["greaterThan", 100, 0]] */
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

/* Branch helper: Converts the output of `convertBranchInputs` into a formatted string
 * that can be used in the EJS file. */
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

/* Branching: Given a branch step, converts it into a formatted string that can be included
 * in the EJS file. */
export function createBranchString(step: ActionObjectFromYAML, trigger?: ActionObjectFromYAML) {
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

/* Config Vars: Given a config var, convert its inputs into a formatted string that can be
 * included in the EJS file. */
export function formatConfigVarInputs(configVar: ConfigVarObjectFromYAML) {
  return Object.entries(configVar.inputs || []).map(([key, input]) => {
    return {
      name: key,
      type: input.type,
      value: input.value,
      meta: {
        ...input.meta,
        permissionAndVisibilityType: getPermissionAndVisibilityType(input.meta),
      },
    };
  });
}

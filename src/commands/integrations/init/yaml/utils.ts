import { camelCase } from "lodash-es";
import {
  ActionObjectFromYAML,
  ConfigVarObjectFromYAML,
  ValidComplexYAMLValue,
  ValidYAMLValue,
} from "./types.js";
import { BinaryOperator, BooleanOperator, UnaryOperator } from "@prismatic-io/spectral";

function valueIsNumber(value: unknown) {
  return typeof value === "number" || (typeof value === "string" && !Number.isNaN(Number(value)));
}

function valueIsBoolean(value: unknown) {
  return typeof value === "boolean" || value === "false" || value === "true";
}

/* Given a valid YAML value, wrap it in quotes, escaped backticks,
 * or nothing depending on the case. */
export function wrapValue(value: ValidYAMLValue, ignoreNumbers?: boolean) {
  if (value === "") {
    return `""`;
  } else if (valueIsBoolean(value) || (valueIsNumber(value) && !ignoreNumbers)) {
    // Booleans and numbers shouldn't be wrapped
    return value;
  } else if (typeof value === "string" && value.indexOf("\n") >= 0) {
    // Multiline strings
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
  loop?: ActionObjectFromYAML,
) {
  const valuePath = refValue.split(".");
  const [stepName, resultsKey, ...rest] = valuePath;
  let suffix = "";

  rest.forEach((term) => {
    const formattedTerm = valueIsNumber(term) ? `[${term}]` : `.${term}`;
    suffix += formattedTerm;
  });

  if (trigger && stepName === camelCase(trigger.name)) {
    return `params.onTrigger.results${suffix}`;
  } else if (loop) {
    if (resultsKey === "currentItem") {
      if (loop.action.key === "loopOverItems") {
        return `${stepName}Item${suffix}`;
      } else if (loop.action.key === "loopNTimes") {
        return `${stepName}.data[${stepName}Idx]${suffix}`;
      }
    }

    return `${stepName}.data${suffix}`;
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

function convertTemplateInput(
  input: string,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  let resultString = input.replace(CONFIG_VAR_REGEX, '$${configVars["$1"]}');

  const referenceMatches = resultString.match(STEP_REF_REGEX);
  (referenceMatches || []).forEach((match) => {
    resultString = resultString.replace(match, convertYAMLReferenceValue(match, trigger, loop));
    resultString = resultString.replace(STEP_REF_REGEX, "$${$1}");
  });

  return `\`${resultString}\``;
}

/* Flows: Given a flow action step, convert its inputs into a CNI-compatible string
 * that will then be included in the EJS file. */
export function createFlowInputsString(
  action: ActionObjectFromYAML,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
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
      currentInputString += `${convertYAMLReferenceValue(input.value as string, trigger, loop)},`;
    } else if (input.type === "configVar") {
      currentInputString += `configVars["${input.value}"],`;
    } else if (input.type === "template") {
      currentInputString += `${convertTemplateInput(input.value as string, trigger, loop)},`;
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

/* Loop: Given a loop step, convert it into a string that can
 * be included in the EJS file. */
export function createLoopString(
  step: ActionObjectFromYAML,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const loopStepName = camelCase(step.name);
  let loopString = `const ${loopStepName}: { data: Array<any> } = { data: [] };\n`;
  const isBreakLoop = step.action.key === "breakLoop";
  const parentLoop = loop ?? step;

  if (isBreakLoop) {
    return "break;\n";
  }

  if (step.action.key === "loopOverItems") {
    const items = step.inputs.items;
    let convertedRef: string;
    switch (items.type) {
      case "reference":
        convertedRef = convertYAMLReferenceValue(items.value as string, trigger, parentLoop);
        loopString += `for (const ${loopStepName}Item of ${convertedRef}) {`;
        break;
      case "configVar":
        loopString += `for (const ${loopStepName}Item of configVars["${items.value}"]) {`;
        break;
      default:
        // If you attempt to do this via the UI, you run into an error in the test runner.
        throw `Error in ${loopStepName}: We do not support looping over string values or templates.`;
    }
  } else if (step.action.key === "loopNTimes") {
    const iterationCount = Number.parseInt(step.inputs.iterationCount.value as string);
    loopString += `for (let ${loopStepName}Idx = 0; ${loopStepName}Idx < ${iterationCount}; ${loopStepName}Idx++) {`;
  } else {
    throw `Cannot generate loop code for a non-loop step: ${step.name}`;
  }

  (step.steps || []).some((childStep) => {
    if (childStep.action.component.key === "loop") {
      loopString += createLoopString(childStep, trigger, parentLoop);
    } else if (getBranchKind(childStep) === "branch") {
      loopString += createBranchString(childStep, trigger, parentLoop);
    } else {
      loopString += `
        const ${camelCase(childStep.name)} = await context.components.${camelCase(
          childStep.action.component.key,
        )}.${childStep.action.key}({
          ${createFlowInputsString(childStep, trigger, parentLoop)}
        });
      `;
    }
  });

  const lastStep = (step.steps || []).at(-1);

  if (lastStep) {
    loopString += `
      ${loopStepName}.data.push(${camelCase(lastStep.name)}.data);
    }\n`;
  }

  return loopString;
}

/* Branch helper: Determines if a step is actually branching or not. */
export function getBranchKind(step: ActionObjectFromYAML) {
  if (step.action.component.key === "branch") {
    return step.action.key === "selectExecutedStepResult" ? "selectExecutedStepResult" : "branch";
  }
  return "";
}

/* Branch helper: Converts plain strings into operators compatible with the evaluate fn */
function convertOperator(value: string) {
  if (Object.keys(UnaryOperator).includes(value)) {
    return `UnaryOperator.${value}`;
  } else if (Object.keys(BinaryOperator).includes(value)) {
    return `BinaryOperator.${value}`;
  } else if (Object.keys(BooleanOperator).includes(value)) {
    return `BooleanOperator.${value}`;
  } else {
    return value;
  }
}

/* Branch helper: Given an object that represents a conditional expression, convert
 * it into a string that can be included in the result of convertBranchInputs. */
function convertObjToExpression(
  obj: { type: string; value: string },
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const { type, value } = obj;

  switch (type) {
    case "configVar":
      return `configVars["${value}"]`;
    case "value":
      if (valueIsNumber(value)) {
        return Number.parseInt(value);
      } else {
        return `"${value}"`;
      }
    case "template":
      return convertTemplateInput(value, trigger, loop);
    case "reference":
      return convertYAMLReferenceValue(value, trigger, loop);
    default:
      return `"@FIXME - The converter ran into an error when attemping to parse this value."`;
  }
}

/* Branch helper: Given a branch step's inputs, convert it into a condition expression,
 * e.g. ["and", ["greaterThan", 100, 0]] */
function convertBranchInputs(
  inputs: ValidComplexYAMLValue,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const result: Array<unknown> = [];

  inputs.forEach((input, i) => {
    if (typeof input === "string") {
      result.push(convertOperator(input));
    } else if (Array.isArray(input)) {
      result.push(convertBranchInputs(input, trigger, loop));
    } else {
      result.push(
        convertObjToExpression(
          input as { name: string; type: string; value: string },
          trigger,
          loop,
        ),
      );
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
export function createBranchString(
  step: ActionObjectFromYAML,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const branchStepName = camelCase(step.name);

  let branchString = `
    let ${branchStepName}Branch = 'Else';
    let ${branchStepName}: any;
  `;
  const inputConditions = step.inputs.conditions.value as ValidComplexYAMLValue;

  inputConditions.forEach((condition, i) => {
    const ifStatement = i === 0 ? "if" : "else if";
    branchString += `
      ${ifStatement} (evaluate(${stringifyCondition(
        convertBranchInputs(condition.value as ValidComplexYAMLValue, trigger, loop),
      )})) {
        ${branchStepName}Branch = "${condition.name}";
      }
    `;
  });

  const branchSteps = step.branches ?? [];

  branchSteps.forEach((branch, i) => {
    branchString += `if (${branchStepName}Branch === "${branch.name}") {`;

    branch.steps.forEach((step, i) => {
      if (step.action.component.key === "loop") {
        branchString += createLoopString(step, trigger, loop);
      } else if (getBranchKind(step) === "branch") {
        branchString += createBranchString(step, trigger, loop);
      } else {
        branchString += `
          const ${camelCase(step.name)}: any = await context.components.${camelCase(
            step.action.component.key,
          )}.${step.action.key}({
            ${createFlowInputsString(step, trigger, loop)}
          });
        `;
      }
    });

    if (!branchString.includes("break;")) {
      const lastStep = branch.steps.at(-1);

      if (lastStep) {
        branchString += `${branchStepName} = ${camelCase(lastStep.name)}\n`;
      }
    }

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

import {
  ActionObjectFromYAML,
  ConfigVarObjectFromYAML,
  FlowObjectFromYAML,
  ValidComplexYAMLValue,
  ValidYAMLValue,
} from "./types.js";
import { gql, gqlRequest } from "../../../../graphql.js";
import { camelCase, xor } from "lodash-es";
import { writeBranchString, getBranchKind } from "./branching.js";
import { SourceFile } from "ts-morph";

export function valueIsNumber(value: unknown) {
  return typeof value === "number" || (typeof value === "string" && !Number.isNaN(Number(value)));
}

export function valueIsBoolean(value: unknown) {
  let isBoolean = false;

  if (typeof value === "boolean") {
    isBoolean = true;
  } else if (typeof value === "string") {
    const lowercased = value.toLowerCase();
    if (lowercased === "false" || lowercased === "true") {
      isBoolean = true;
    }
  }

  return isBoolean;
}

/* Given a valid YAML value, wrap it in quotes, escaped backticks,
 * or nothing depending on the case. */
export function wrapValue(
  value: ValidYAMLValue | ValidComplexYAMLValue | undefined,
  ignoreNumbers?: boolean,
) {
  if (valueIsBoolean(value)) {
    const formattedValue = typeof value === "string" ? value.toLowerCase() : value;
    // Boolean-like values shouldn't be wrapped
    return formattedValue;
  } else if (value === "" || !value) {
    return `""`;
  } else if (valueIsNumber(value) && !ignoreNumbers) {
    // Number-like values shouldn't be wrapped
    return value;
  } else if (typeof value === "string" && value.indexOf("\n") >= 0) {
    // Multiline strings
    const escapedValue = value.replace(/`/g, "\\`");
    return `\`${escapedValue}\``;
  } else if (typeof value === "object") {
    return convertYAMLObjectIntoString(value as ValidComplexYAMLValue);
  } else {
    return `"${value}"`;
  }
}

const EXCEPTION_CHARACTERS = [" ", "-", ":"];

function includesExceptionChars(input: string) {
  let hasChars = false;

  for (const char of EXCEPTION_CHARACTERS) {
    if (input.indexOf(char) !== -1) {
      hasChars = true;
      break;
    }
  }

  return hasChars;
}

/* Convert a YAML reference path into one that will work in CNI code. Examples:
 *   myAction.results.1 => myAction.data[1]
 *   myTriggerStepName.results => params.onTrigger.results */
export function convertYAMLReferenceValue(
  refValue: string,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const valuePath = refValue.split(".");
  const [stepName, resultsKey, ...rest] = valuePath;
  let suffix = "";

  rest.forEach((term) => {
    const formattedTerm = valueIsNumber(term)
      ? `[${term}]`
      : includesExceptionChars(term)
        ? `["${term}"]`
        : `.${term}`;
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

const TEMPLATE_PLACEHOLDER_REGEX = /\{\{([#\$])([^\}]+)\}\}/g;

/* Given a template input, convert it into an interpolated string.
 *
 * from: Hello this is my template: {{#My Var}}, and {{$myAction.results.testKey}}
 * into: `Hello this is my template: ${configVars["My Var"]}, and ${myAction.data.testKey}`
 */
export function convertTemplateInput(
  input: string,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const result = input.replace(TEMPLATE_PLACEHOLDER_REGEX, (_, refTypeChar, name) => {
    if (refTypeChar === "#") {
      // Config variable reference
      return `\$\{configVars["${name}"]\}`;
    } else if (refTypeChar === "$") {
      // Step result reference
      const replacement = convertYAMLReferenceValue(name, trigger, loop);
      return `\$\{${replacement}\}`;
    } else {
      throw `Unexpected reference type character: ${refTypeChar}`;
    }
  });
  return `\`${result}\``;
}

export function convertBody(
  step: ActionObjectFromYAML,
  bodyString: string,
  file: SourceFile,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  let result = bodyString;

  if (step.action.component.key === "loop") {
    result += writeLoopString(step, file, trigger, loop);
  } else if (getBranchKind(step) === "branch") {
    result += writeBranchString(step, file, trigger, loop);
  } else {
    result += `
      const ${camelCase(step.name)} = await context.components.${camelCase(
        step.action.component.key,
      )}.${step.action.key}({
        ${createFlowInputsString(step, trigger, loop)}
      });
    `;
  }

  return result;
}

export function convertYAMLObjectIntoString(value: ValidComplexYAMLValue) {
  let shouldWrap = true;
  let isObject = false;
  let resultString = "";

  if (!value || value.length === 0) {
    shouldWrap = false;
    resultString = `${JSON.stringify(value)}`;
  } else {
    value.forEach((element) => {
      if (element.name) {
        isObject = true;
        const key =
          typeof element.name === "string" ? element.name : (element.name.value as string);
        const formattedKey = includesExceptionChars(key) ? `"${key}"` : key;
        resultString += `${formattedKey}: ${wrapValue(element.value as string)},`;
      } else {
        resultString += `${wrapValue(element.value as string)},`;
      }
    });
  }

  if (shouldWrap) {
    resultString = isObject ? `{${resultString}}` : `[${resultString}]`;
  }

  return resultString;
}

/* Flows: Given a flow action step, convert its inputs into a template string. */
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
      currentInputString += `${convertYAMLObjectIntoString(input.value as ValidComplexYAMLValue)},`;
    } else if (input.type === "reference") {
      currentInputString += `${convertYAMLReferenceValue(input.value as string, trigger, loop)},`;
    } else if (input.type === "configVar") {
      if (action.isTrigger) {
        currentInputString += `"${input.value}"`;
      } else {
        currentInputString += `configVars["${input.value}"],`;
      }
    } else if (input.type === "template") {
      currentInputString += `${convertTemplateInput(input.value as string, trigger, loop)},`;
    } else {
      currentInputString += `${wrapValue(input.value as ValidYAMLValue)},`;
    }

    if (action.isTrigger) {
      if (input.type === "configVar") {
        resultString += `\n${key}: { configVar: ${currentInputString} },`;
      } else {
        resultString += `\n${key}: { value: ${currentInputString} },`;
      }
    } else {
      resultString += `\n${key}: ${currentInputString}`;
    }
  });

  // Replace first new line.
  return resultString.replace(/^\n/, "");
}

/* Loop: Given a loop step, convert it into a template string. */
export function writeLoopString(
  step: ActionObjectFromYAML,
  file: SourceFile,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const loopStepName = camelCase(step.name);
  let loopString = `const ${loopStepName}: { data: unknown[] } = { data: [] };\n`;
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
    loopString = convertBody(childStep, loopString, file, trigger, loop);
  });

  const lastStep = (step.steps || []).at(-1);

  if (lastStep) {
    const lastStepResultRef =
      getBranchKind(lastStep) === "branch"
        ? camelCase(lastStep.name)
        : `${camelCase(lastStep.name)}.data`;
    loopString += `
      ${loopStepName}.data.push(${lastStepResultRef});
    }\n`;
  }

  return loopString;
}

/* Config Vars: Given a config var object, format its inputs so it is consumable by the writers. */
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

/* Returns of map of component names and a boolean denoting if the component is public. */
export async function extractComponentList(flows: Array<FlowObjectFromYAML>) {
  const componentMap: Record<string, boolean> = {};
  const stepListsToProcess: Array<Array<ActionObjectFromYAML>> = [];

  flows.forEach((flow) => {
    flow.steps.forEach((step) => {
      const key = step.action.component.key;
      if (!componentMap[key]) {
        componentMap[key] = true;
      }

      if (step.steps) {
        stepListsToProcess.push(step.steps);
      }
    });
  });

  while (stepListsToProcess.length > 0) {
    const current = stepListsToProcess.pop();

    (current ?? []).forEach((step) => {
      const key = step.action.component.key;
      if (!componentMap[key]) {
        componentMap[key] = true;
      }

      if (step.steps) {
        stepListsToProcess.push(step.steps);
      }
    });
  }

  const componentKeys = Object.keys(componentMap);

  try {
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
  } catch (e) {
    console.error(
      "Error fetching component registry info. Skipping component registry generation.",
    );
    console.error(e);

    return {
      public: [],
      private: [],
    };
  }
}

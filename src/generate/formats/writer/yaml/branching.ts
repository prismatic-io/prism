import {
  ActionObjectFromYAML,
  ConditionObjectFromYAML,
  OPERATOR_PHRASE_TO_EXPRESSION,
  ValidComplexYAMLValue,
  ValidYAMLValue,
} from "./types.js";
import {
  convertBody,
  convertTemplateInput,
  convertYAMLReferenceValue,
  wrapValue,
} from "./utils.js";
import { camelCase, uniq } from "lodash-es";
import { SourceFile } from "ts-morph";

type ParsedConditionalValue = string | ParsedCondition;

interface ParsedCondition {
  clause: string;
  values: Array<ParsedConditionalValue>;
}

/* Given a branch step, converts it into a template string.
 * Also updates file imports as a side effect. */
export function writeBranchString(
  step: ActionObjectFromYAML,
  file: SourceFile,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const branchStepName = camelCase(step.name);
  const branchData: Record<string, { ifStatement: string; condition: string; body: string }> = {};

  if (step.inputs.conditions) {
    const inputConditions = step.inputs.conditions.value as ValidComplexYAMLValue;

    inputConditions.forEach((condition, i) => {
      const ifStatement = i === 0 ? "if" : "else if";
      const formattedCondition = _formatConditionObject(
        _convertInputIntoConditionObject(condition.value as ConditionObjectFromYAML, trigger, loop),
      );

      branchData[condition.name as string] = {
        ifStatement: ifStatement,
        condition: `(${formattedCondition.string})`,
        body: "",
      };

      file.addImportDeclarations([
        {
          moduleSpecifier: "@prismatic-io/spectral/dist/conditionalLogic",
          namedImports: formattedCondition.includes,
        },
      ]);
    });
  } else if (step.inputs.branchValueMappings) {
    const inputConditions = step.inputs.branchValueMappings.value as ValidComplexYAMLValue;
    const valueToCompare = _convertConditionIntoTermExpression(
      step.inputs.inputValue,
      trigger,
      loop,
    );

    inputConditions.forEach((condition, i) => {
      const ifStatement = i === 0 ? "if" : "else if";
      const formattedCondition = `${valueToCompare} === ${_convertConditionIntoTermExpression(
        {
          type: condition.type,
          value: condition.value,
        },
        trigger,
        loop,
      )}`;

      branchData[condition.name as string] = {
        ifStatement: ifStatement,
        condition: `(${formattedCondition})`,
        body: "",
      };
    });
  }

  const branchSteps = step.branches ?? [];

  branchSteps.forEach((branch, i) => {
    let bodyString = "";
    branch.steps.forEach((step, i) => {
      bodyString = convertBody(step, "", file, trigger, loop);
    });

    if (!bodyString.includes("break;")) {
      const lastStep = branch.steps.at(-1);

      if (lastStep) {
        bodyString += `${branchStepName} = "${branch.name}";`;
      }
    }

    if (branch.name !== "Else") {
      branchData[branch.name].body = bodyString;
    } else {
      branchData.Else = {
        ifStatement: "else",
        condition: "",
        body: bodyString,
      };
    }
  });

  let resultString = `\n/* This string is the name of the branch that this conditional block resolves to. */\nlet ${branchStepName}: string;\n`;

  Object.entries(branchData).forEach(([_key, data]) => {
    const { ifStatement, condition, body } = data;
    resultString += `${ifStatement} ${condition} {${body}} `;
  });

  return resultString;
}

/* Determines if a step is actually branching or not. */
export function getBranchKind(step: ActionObjectFromYAML) {
  if (step.action.component.key === "branch") {
    return step.action.key === "selectExecutedStepResult" ? "selectExecutedStepResult" : "branch";
  }
  return "";
}

/* Given a parsed YAML object that represents a condition value, convert it
 * into a term expression. */
function _convertConditionIntoTermExpression(
  obj: { type: string; value: ValidYAMLValue },
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const { type, value } = obj;

  switch (type) {
    case "configVar":
      return `configVars["${value}"]`;
    case "value":
      return `${wrapValue(value)}`;
    case "template":
      return convertTemplateInput(value as string, trigger, loop);
    case "reference":
      return convertYAMLReferenceValue(value as string, trigger, loop);
    default:
      return `"@FIXME - The converter ran into an error when attemping to parse this value."`;
  }
}

/* Given a condition input object from a YAML file, convert it into a ParsedCondition.
 * ParsedConditions are an internal type used to further process the data. */
export function _convertInputIntoConditionObject(
  inputs: ConditionObjectFromYAML,
  trigger?: ActionObjectFromYAML,
  loop?: ActionObjectFromYAML,
) {
  const condition: { clause: string; values: Array<ParsedConditionalValue> } = {
    clause: "",
    values: [],
  };

  inputs.forEach((input, i) => {
    if (typeof input === "string") {
      // In this case the given input is the clause.
      condition.clause = input;
    } else if (Array.isArray(input)) {
      // If the input is an array, that means we've hit a subcondition.
      condition.values.push(
        _convertInputIntoConditionObject(input as ConditionObjectFromYAML, trigger, loop),
      );
    } else {
      // Otherwise, we are dealing with a condition value & should convert it.
      condition.values.push(
        _convertConditionIntoTermExpression(
          input as { name: string; type: string; value: string },
          trigger,
          loop,
        ),
      );
    }
  });

  return condition;
}

/* Given a ParsedCondition, format it into a condition string and a list of imports.
 * Example string output would be the $CONDITION in `if ($condition) { $body }`) */
export function _formatConditionObject(condition: ParsedCondition) {
  const { clause, values } = condition;
  const stripClause = clause === "and" && values.length === 1;
  let resultString = "";
  let includes: Array<string> = [];

  if (stripClause) {
    const formatted = _formatConditionObject(values[0] as ParsedCondition);
    resultString += formatted.string;
    includes = includes.concat(formatted.includes);
  } else {
    const expression = OPERATOR_PHRASE_TO_EXPRESSION[clause];
    if (expression) {
      let expressionString = expression.expression;
      const [left, right] = values;
      let leftTerm: string;
      let rightTerm: string;

      if (typeof left === "string") {
        leftTerm = left;
      } else {
        const formattedLeft = _formatConditionObject(left);
        leftTerm = `(${formattedLeft.string})`;
        includes = includes.concat(formattedLeft.includes);
      }

      if (typeof right === "string" || !right) {
        rightTerm = right;
      } else {
        const formattedRight = _formatConditionObject(right);
        rightTerm = `(${formattedRight.string})`;
        includes = includes.concat(formattedRight.includes);
      }

      expressionString = expressionString.replace("$LEFT_TERM", leftTerm);

      if (rightTerm) {
        expressionString = expressionString.replace("$RIGHT_TERM", rightTerm);
      }

      resultString += expressionString;

      if (expression.includes) {
        includes = includes.concat(expression.includes);
      }
    } else {
      // @TODO
      throw "Invalid condition.";
    }
  }

  return {
    string: resultString,
    includes: uniq(includes),
  };
}

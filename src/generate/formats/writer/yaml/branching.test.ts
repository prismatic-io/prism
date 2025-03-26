import { describe, it, expect } from "bun:test";
import {
  _convertConditionIntoTermExpression,
  _convertInputIntoConditionObject,
  _formatConditionObject,
} from "./branching";

describe("_convertInputIntoConditionObject", () => {
  it.each([
    {
      inputs: [
        "and",
        [
          "greaterThan",
          {
            type: "reference",
            value: "codeBlock.results",
            name: "",
          },
          {
            type: "value",
            value: "100",
            name: "",
          },
        ],
      ],
      trigger: undefined,
      loop: undefined,
      expected: {
        clause: "and",
        values: [
          {
            clause: "greaterThan",
            values: ["codeBlock.data", "100"],
          },
        ],
      },
    },
  ])(
    "correctly converts condition input into a condition object",
    ({ inputs, trigger, loop, expected }) => {
      expect(_convertInputIntoConditionObject(inputs, trigger, loop)).toStrictEqual(expected);
    },
  );
});

describe("_formatConditionObject", () => {
  it.each([
    {
      input: {
        clause: "and",
        values: [
          {
            clause: "greaterThan",
            values: ["codeBlock.data.data", "100"],
          },
        ],
      },
      expected: {
        string: "codeBlock.data.data > 100",
        includes: [],
      },
    },
    {
      input: {
        clause: "and",
        values: [
          {
            clause: "or",
            values: [
              "stepResult.data",
              {
                clause: "and",
                values: ["stepResult2.data", "stepResult3.data"],
              },
            ],
          },
        ],
      },
      expected: {
        string: "stepResult.data || (stepResult2.data && stepResult3.data)",
        includes: [],
      },
    },
    {
      input: {
        clause: "and",
        values: [
          {
            clause: "and",
            values: [
              {
                clause: "or",
                values: ["stepResult.data", "stepResult2.data"],
              },
              "stepResult3.data",
            ],
          },
        ],
      },
      expected: {
        string: "(stepResult.data || stepResult2.data) && stepResult3.data",
        includes: [],
      },
    },
    {
      input: {
        clause: "and",
        values: [
          {
            clause: "doesNotExist",
            values: ["stepResult.data"],
          },
        ],
      },
      expected: {
        string: "evaluatesNull(stepResult.data)",
        includes: ["evaluatesNull"],
      },
    },
    {
      input: {
        clause: "and",
        values: [
          {
            clause: "dateTimeBefore",
            values: ["stepResult.data", "stepResult2.data"],
          },
        ],
      },
      expected: {
        string: "dateIsBefore(stepResult.data, stepResult2.data)",
        includes: ["dateIsBefore"],
      },
    },
  ])("correctly converts condition input into a condition object", ({ input, expected }) => {
    expect(_formatConditionObject(input).string).toStrictEqual(expected.string);
    expect(_formatConditionObject(input).includes).toStrictEqual(expected.includes);
  });
});

describe("_convertConditionIntoTermExpression", () => {
  it.each([
    {
      obj: { type: "configVar", value: "My config var" },
      expected: `configVars["My config var"]`,
    },
    {
      obj: { type: "value", value: "My string" },
      expected: `"My string"`,
    },
    // other types of inputs tested via convertTemplateInput and convertYAMLReferenceValue
  ])("correctly converts condition into a term expression", ({ obj, expected }) => {
    expect(_convertConditionIntoTermExpression(obj)).toEqual(expected);
  });
});

import { describe, it, expect } from "bun:test";
import {
  convertTemplateInput,
  convertYAMLReferenceValue,
  createFlowInputsString,
  writeLoopString,
  wrapValue,
} from "./utils";
import { SourceFile } from "ts-morph";

describe("wrapValue", () => {
  it.each([
    {
      input: undefined,
      expected: '""',
    },
    {
      input: "",
      expected: '""',
    },
    {
      input: "my string",
      expected: '"my string"',
    },
    {
      input: "my\nmultiline string",
      expected: "`my\nmultiline string`",
    },
    {
      input: "7",
      expected: "7",
    },
    {
      input: 7,
      expected: 7,
    },
    {
      input: false,
      expected: false,
    },
    {
      input: "true",
      expected: "true",
    },
  ])("correctly wraps the input value", ({ input, expected }) => {
    expect(wrapValue(input)).toStrictEqual(expected);
  });
});

describe("convertYAMLReferenceValue", () => {
  it.each([
    {
      refValue: "myAction.results.1",
      trigger: undefined,
      loop: undefined,
      expected: "myAction.data[1]",
    },
    {
      refValue: "codeBlock.results",
      trigger: undefined,
      loop: undefined,
      expected: "codeBlock.data",
    },
    {
      refValue: "myTrigger.results",
      trigger: {
        isTrigger: true,
        description: "",
        inputs: {},
        name: "My Trigger",
        action: {
          component: {
            key: "my-component",
            isPublic: true,
            version: 1,
          },
          key: "my-trigger",
        },
      },
      loop: undefined,
      expected: "params.onTrigger.results",
    },
    {
      refValue: "myLoop.results.2.test",
      trigger: undefined,
      loop: {
        description: "",
        inputs: {},
        name: "My Trigger",
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopOverItems",
        },
      },
      expected: "myLoop.data[2].test",
    },
    {
      refValue: "myLoop.currentItem.test",
      trigger: undefined,
      loop: {
        description: "",
        inputs: {},
        name: "My Trigger",
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopNTimes",
        },
      },
      expected: "myLoop.data[myLoopIdx].test",
    },
    {
      refValue: "myLoop.currentItem.test",
      trigger: undefined,
      loop: {
        description: "",
        inputs: {},
        name: "My Trigger",
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopOverItems",
        },
      },
      expected: "myLoopItem.test",
    },
    {
      refValue: "myRef.results.this has spaces in it.this also has spaces in it.test",
      trigger: undefined,
      loop: undefined,
      expected: 'myRef.data["this has spaces in it"]["this also has spaces in it"].test',
    },
  ])("correctly converts YAML refs into valid JS refs", ({ refValue, trigger, loop, expected }) => {
    expect(convertYAMLReferenceValue(refValue, trigger, loop)).toStrictEqual(expected);
  });
});

describe("convertTemplateInput", () => {
  it.each([
    {
      input:
        "My template: {{#My Var}}, and {{$myAction.results.testKey}}, and {{$codeBlock.results}}",
      trigger: undefined,
      loop: undefined,
      expected:
        '`My template: ${configVars["My Var"]}, and ${myAction.data.testKey}, and ${codeBlock.data}`',
    },
  ])(
    "correctly converts template inputs into interpolated strings",
    ({ input, trigger, loop, expected }) => {
      expect(convertTemplateInput(input, trigger, loop)).toStrictEqual(expected);
    },
  );
});

describe("createFlowInputsString", () => {
  it.each([
    {
      action: {
        action: {
          component: {
            key: "my-component",
            isPublic: false,
            version: 1,
          },
          key: "my-action",
        },
        description: "My test action",
        inputs: {
          myInput: {
            type: "string",
            value: "my input",
          },
          myBooleanInput: {
            type: "boolean",
            value: false,
          },
          myObjectInput: {
            type: "complex",
            value: [
              {
                type: "string",
                name: "keyA",
                value: "valueA",
              },
              {
                type: "string",
                name: "keyB",
                value: "valueB",
              },
            ],
          },
          myArrayInput: {
            type: "complex",
            value: [
              {
                type: "string",
                value: "abc",
              },
              {
                type: "string",
                value: "def",
              },
            ],
          },
          myReferenceInput: {
            type: "reference",
            value: "someStep.results.foo",
          },
          myTemplateInput: {
            type: "template",
            value: "{{#My Var}} and {{$myRef.results.bar}}",
          },
          myLoopRef: {
            type: "reference",
            value: "myLoop.results.1",
          },
          myTriggerRef: {
            type: "reference",
            value: "myTrigger.results.foo",
          },
        },
        name: "My step name",
      },
      trigger: {
        action: {
          component: {
            key: "webhook-triggers",
            isPublic: true,
            version: 1,
          },
          key: "my-trigger",
        },
        description: "",
        inputs: {},
        name: "",
      },
      loop: {
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopNTimes",
        },
        description: "",
        inputs: {},
        name: "",
      },
      expected:
        'myInput: "my input",\nmyBooleanInput: false,\nmyObjectInput: {keyA: "valueA",keyB: "valueB",},\nmyArrayInput: ["abc","def",],\nmyReferenceInput: someStep.data.foo,\nmyTemplateInput: `${configVars["My Var"]} and ${myRef.data.bar}`,\nmyLoopRef: myLoop.data[1],\nmyTriggerRef: myTrigger.data.foo,',
    },
  ])(
    "correctly converts template inputs into interpolated strings",
    ({ action, trigger, loop, expected }) => {
      expect(createFlowInputsString(action, trigger, loop)).toStrictEqual(expected);
    },
  );
});

describe("writeLoopString", () => {
  it.each([
    {
      step: {
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopNTimes",
        },
        description: "",
        inputs: {
          iterationCount: {
            type: "number",
            value: 10,
          },
        },
        name: "My loop step",
        steps: [
          {
            action: {
              component: {
                key: "my-component",
                isPublic: true,
                version: 1,
              },
              key: "doSomething",
            },
            description: "",
            inputs: {
              someInput: {
                type: "string",
                value: "abc",
              },
            },
            name: "My step",
          },
          {
            action: {
              component: {
                key: "my-component",
                isPublic: true,
                version: 1,
              },
              key: "doSomethingElse",
            },
            description: "",
            inputs: {
              someInput: {
                type: "string",
                value: "def",
              },
            },
            name: "My step 2",
          },
        ],
      },
      file: undefined as unknown as SourceFile,
      trigger: undefined,
      loop: {
        action: {
          component: {
            key: "loop",
            isPublic: true,
            version: 1,
          },
          key: "loopNTimes",
        },
        description: "",
        inputs: {},
        name: "",
      },
      expected:
        'const myLoopStep: { data: unknown[] } = { data: [] };\nfor (let myLoopStepIdx = 0; myLoopStepIdx < 10; myLoopStepIdx++) {\n      const myStep = await context.components.myComponent.doSomething({\n        someInput: "abc",\n      });\n    \n      const myStep2 = await context.components.myComponent.doSomethingElse({\n        someInput: "def",\n      });\n    \n      myLoopStep.data.push(myStep2.data);\n    }\n',
    },
  ])(
    "correctly converts loop step objects into an interpolated string",
    ({ step, file, trigger, loop, expected }) => {
      expect(writeLoopString(step, file, trigger, loop)).toStrictEqual(expected);
    },
  );
});

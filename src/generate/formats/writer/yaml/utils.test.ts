import { describe, it, expect } from "bun:test";
import {
  convertTemplateInput,
  convertYAMLReferenceValue,
  createFlowInputsString,
  writeLoopString,
  formatInputValue,
  extractComponentList,
} from "./utils";
import { SourceFile } from "ts-morph";
import { load } from "js-yaml";
import { promises as fs } from "fs";
import { IntegrationObjectFromYAML } from "./types";

describe("formatInputValue", () => {
  it.each([
    [
      "undefined => empty string",
      {
        input: undefined,
        expected: '""',
      },
    ],
    [
      "empty string => empty string",
      {
        input: "",
        expected: '""',
      },
    ],
    [
      "normal string",
      {
        input: "my string",
        expected: '"my string"',
      },
    ],
    [
      "multiline string",
      {
        input: "my\nmultiline string",
        expected: "`my\nmultiline string`",
      },
    ],
    [
      "stringified number",
      {
        input: "7",
        expected: "7",
      },
    ],
    [
      "actual integer",
      {
        input: 7,
        expected: 7,
      },
    ],
    [
      "actual boolean",
      {
        input: false,
        expected: false,
      },
    ],
    [
      "stringified boolean",
      {
        input: "true",
        expected: "true",
      },
    ],
  ])("correctly wraps the input value: %s", (_scenario, { input, expected }) => {
    expect(formatInputValue(input)).toStrictEqual(expected);
  });
});

describe("convertYAMLReferenceValue", () => {
  it.each([
    [
      "basic step result",
      {
        refValue: "myAction.results.1",
        trigger: undefined,
        loop: undefined,
        expected: "myAction.data[1]",
      },
    ],
    [
      "code block result",
      {
        refValue: "codeBlock.results",
        trigger: undefined,
        loop: undefined,
        expected: "codeBlock.data",
      },
    ],
    [
      "trigger result",
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
    ],
    [
      "loop step result with index",
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
    ],
    [
      "loop step result with nested fields",
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
    ],
    [
      "loop currentItem result",
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
    ],
    [
      "nested reference where the keys have spaces",
      {
        refValue: "myRef.results.this has spaces in it.this also has spaces in it.test",
        trigger: undefined,
        loop: undefined,
        expected: 'myRef.data["this has spaces in it"]["this also has spaces in it"].test',
      },
    ],
  ])(
    "correctly converts YAML refs into valid JS refs: %s",
    (_scenario, { refValue, trigger, loop, expected }) => {
      expect(convertYAMLReferenceValue(refValue, trigger, loop)).toStrictEqual(expected);
    },
  );
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
    {
      input: "{{#My Var}}{{$myAction.results.testKey}}{{$codeBlock.results}}",
      trigger: undefined,
      loop: undefined,
      expected: '`${configVars["My Var"]}${myAction.data.testKey}${codeBlock.data}`',
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

const TEST_YAML_PATH = "src/commands/integrations/convert/fixtures/specs/test-integration.yaml";

describe("extractComponentList", () => {
  it("extracts the right list of components", async () => {
    const basePath = process.env.PWD ?? process.cwd();
    process.chdir(basePath);
    const integration = load(
      await fs.readFile(TEST_YAML_PATH, "utf-8"),
    ) as IntegrationObjectFromYAML;
    const result = await extractComponentList(integration);
    expect(result).toMatchObject({
      branch: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      code: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      log: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      salesforce: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      "schedule-triggers": {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      slack: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
      sleep: {
        isPublic: true,
        registryPrefix: "@component-manifests",
        version: "LATEST",
      },
    });
  });
});

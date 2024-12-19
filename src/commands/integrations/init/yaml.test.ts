import { describe, it, expect } from "bun:test";
import GenerateIntegrationFromYAMLCommand, { createInputsString } from "./yaml.js";
import fs from "fs";
import path from "path";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs";

describe("createInputsString", () => {
  const testAction = {
    action: {
      component: {
        isPublic: true,
        key: "test-component",
        version: 14,
      },
      key: "test-component-trigger",
    },
    description: "",
    inputs: {
      emptyInput: {
        type: "value",
        value: "",
      },
      stringInput: {
        type: "value",
        value: "my string",
      },
      numberInput: {
        type: "value",
        value: 1,
      },
      booleanInput: {
        type: "value",
        value: false,
      },
      keyValueListInput: {
        type: "complex",
        value: [
          {
            type: "value",
            value: "myValueA",
            name: {
              type: "value",
              value: "myKeyA",
            },
          },
          {
            type: "value",
            value: "myValueB",
            name: {
              type: "value",
              value: "myKeyB",
            },
          },
        ],
      },
      emptyKeyValueListInput: {
        type: "complex",
        value: [],
      },
      valueListInput: {
        type: "complex",
        value: ["item a", "item b", "item c"],
      },
      emptyValueListInput: {
        type: "complex",
        value: [],
      },
    },
    name: "Test action",
    isTrigger: false,
    steps: [],
  };

  describe("for triggers", () => {
    const testTrigger = {
      ...testAction,
      isTrigger: true,
    };

    const expected = `
emptyInput: { value: "", },
stringInput: { value: "my string", },
numberInput: { value: 1, },
booleanInput: { value: false, },
keyValueListInput: { value: {myKeyA: "myValueA",myKeyB: "myValueB",}, },
emptyKeyValueListInput: { value: [], },
valueListInput: { value: ["undefined","undefined","undefined",], },
emptyValueListInput: { value: [], },`;

    it("correctly converts inputs", () => {
      const resultString = createInputsString(testTrigger);
      expect(resultString).toBe(expected);
    });
  });

  describe("for actions", () => {
    const expected = `
emptyInput: "",
stringInput: "my string",
numberInput: 1,
booleanInput: false,
keyValueListInput: {myKeyA: "myValueA",myKeyB: "myValueB",},
emptyKeyValueListInput: [],
valueListInput: ["undefined","undefined","undefined",],
emptyValueListInput: [],`;

    it("correctly converts inputs", () => {
      const resultString = createInputsString(testAction);
      expect(resultString).toBe(expected);
    });
  });
});

const FLOW_GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
interface SpecMeta {
  fileName: string;
  name: string;
}

describe("YAML CNI generation tests", () => {
  const basePath = process.cwd();
  const integrationsPath = path.resolve("src/commands/integrations");
  const tempPath = path.resolve(`${integrationsPath}/init/temp`);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  const specs = fs
    .readdirSync(`${integrationsPath}/init/fixtures/specs`)
    .map<SpecMeta>((fileName) => {
      const [name] = fileName.toLowerCase().split(".");
      return { fileName, name };
    });

  for (const { fileName, name } of specs) {
    describe(name, () => {
      it(
        "should generate successfully",
        async () => {
          process.chdir(tempPath);

          await GenerateIntegrationFromYAMLCommand.run([
            `--yamlFile=../fixtures/specs/${fileName}`,
          ]);

          expect(process.cwd()).toStrictEqual(tempPath);

          process.chdir(basePath);
        },
        FLOW_GENERATION_TIMEOUT,
      );

      it("should match scaffolding snapshots", async () => {
        process.chdir(tempPath);
        // TODO: Bun snapshotting has a bug where it is dropping the slash for `\.ts` in webpack.config.js.
        // Exclude package.json now that we're fetching the latest Spectral version from the registry.
        const targets = await walkDir(name, [".png", "webpack.config.js", "package.json"]);
        for (const target of targets) {
          const contents = await readFile(target, "utf-8");
          expect(contents).toMatchSnapshot(target);
        }

        process.chdir(basePath);
      });
    });
  }
});

import { describe, it, expect } from "bun:test";
import GenerateIntegrationFromYAMLCommand from "./index.js";
import fs from "fs";
import path from "path";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs.js";

const CONVERT_GENERATION_TIMEOUT = 5 * 60 * 5; // 5 minutes

describe("YAML CNI generation tests", () => {
  const basePath = process.env.PWD ?? process.cwd();
  const commandPath = path.resolve("src/commands/experimental/yaml");
  const tempPath = path.resolve(`${commandPath}/temp`);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  describe("test convert integration", () => {
    it(
      "should generate successfully",
      async () => {
        process.chdir(tempPath);

        await GenerateIntegrationFromYAMLCommand.run([
          "../fixtures/specs/test-integration.yaml",
          "--folder=testIntegration",
        ]);

        expect(process.cwd()).toStrictEqual(tempPath);

        process.chdir(basePath);
      },
      CONVERT_GENERATION_TIMEOUT,
    );

    it("should match scaffolding snapshots", async () => {
      process.chdir(tempPath);
      const targets = await walkDir("testIntegration", [
        ".npmrc",
        ".png",
        "webpack.config.js",
        "package.json",
        "src/componentRegistry.ts",
      ]);
      for (const target of targets) {
        const contents = await readFile(target, "utf-8");
        expect(contents).toMatchSnapshot(target);
      }

      process.chdir(basePath);
    });
  });
});

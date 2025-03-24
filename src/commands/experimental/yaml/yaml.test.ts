import { describe, it, expect } from "bun:test";
import GenerateIntegrationFromYAMLCommand from "./index.js";
import fs from "fs";
import path from "path";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs.js";

const CONVERT_GENERATION_TIMEOUT = 5 * 60 * 5; // 5 minutes
interface SpecMeta {
  fileName: string;
  name: string;
}

describe("YAML CNI generation tests", () => {
  const basePath = process.cwd();
  const commandPath = path.resolve("src/commands/experimental/yaml");
  const tempPath = path.resolve(`${commandPath}/temp`);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  const specs = fs.readdirSync(`${commandPath}/fixtures/specs`).map<SpecMeta>((fileName) => {
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
        CONVERT_GENERATION_TIMEOUT,
      );

      // it("should match scaffolding snapshots", async () => {
      //   process.chdir(tempPath);
      //   const targets = await walkDir(name, [".png", "webpack.config.js", "package.json"]);
      //   for (const target of targets) {
      //     const contents = await readFile(target, "utf-8");
      //     expect(contents).toMatchSnapshot(target);
      //   }

      //   process.chdir(basePath);
      // });
    });
  }
});

import { describe, it, expect } from "bun:test";
import GenerateIntegrationFromYAMLCommand from "./yaml.js";
import fs from "fs";
import path from "path";
import { readFile } from "fs-extra";
import { walkDir } from "../../../../fs.js";

const FLOW_GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
interface SpecMeta {
  fileName: string;
  name: string;
}

describe("YAML CNI generation tests", () => {
  const basePath = process.cwd();
  const integrationsPath = path.resolve("src/commands/integrations");
  const tempPath = path.resolve(`${integrationsPath}/init/yaml/temp`);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  const specs = fs
    .readdirSync(`${integrationsPath}/init/yaml/fixtures/specs`)
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

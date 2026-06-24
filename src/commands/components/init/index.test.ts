import fs from "fs";
import { readFile } from "fs-extra";
import { kebabCase } from "lodash-es";
import path from "path";
import { describe, expect, it } from "vitest";
import { walkDir } from "../../../fs";
import { TOOLCHAIN_NAMES } from "../../../utils/toolchain";
import InitializeComponent from ".";

const COMPONENT_GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface SpecMeta {
  type: "openApi" | "wsdl";
  fileName: string;
  name: string;
}

describe("component generation tests", () => {
  const basePath = process.env.PWD ?? process.cwd();
  const componentsPath = path.resolve("src/commands/components");
  const tempPath = path.resolve(`${componentsPath}/init/temp`);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  const specs = fs
    .readdirSync(`${componentsPath}/init/fixtures/specs`)
    .map<SpecMeta>((fileName) => {
      const type = fileName.endsWith(".wsdl") ? "wsdl" : "openApi";
      const [name] = fileName.toLowerCase().split(".");
      return { type, fileName, name };
    });

  for (const toolchain of TOOLCHAIN_NAMES) {
    for (const { type, fileName, name } of specs) {
      const projectName = `${name}-${toolchain}`;

      describe(`${toolchain} - ${type} - ${name}`, () => {
        it(
          "should generate successfully",
          async () => {
            process.chdir(tempPath);

            await InitializeComponent.run([
              projectName,
              `--${kebabCase(type)}-path=../fixtures/specs/${fileName}`,
              "--toolchain",
              toolchain,
            ]);

            expect(process.cwd()).toStrictEqual(tempPath);

            process.chdir(basePath);
          },
          COMPONENT_GENERATION_TIMEOUT,
        );

        it("should match scaffolding snapshots", async () => {
          process.chdir(tempPath);

          const targets = await walkDir(projectName, [".png", "webpack.config.js", "package.json"]);
          for (const target of targets) {
            const contents = await readFile(target, "utf-8");
            expect(contents).toMatchSnapshot(target);
          }

          process.chdir(basePath);
        });
      });
    }
  }
});

import { expect, it, describe } from "bun:test";
import fs from "fs";
import path from "path";
import { kebabCase } from "lodash-es";
import InitializeComponent from ".";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs";

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

  for (const { type, fileName, name } of specs) {
    describe(`${type} - ${name}`, () => {
      it(
        "should generate successfully",
        async () => {
          process.chdir(tempPath);

          await InitializeComponent.run([
            name,
            `--${kebabCase(type)}-path=../fixtures/specs/${fileName}`,
          ]);

          expect(process.cwd()).toStrictEqual(tempPath);

          process.chdir(basePath);
        },
        COMPONENT_GENERATION_TIMEOUT,
      );

      it("should match scaffolding snapshots", async () => {
        process.chdir(tempPath);

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

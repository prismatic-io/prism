import { expect, it, describe } from "bun:test";
import fs from "fs";
import path from "path";
import { kebabCase } from "lodash-es";
import InitializeComponent from ".";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs";

const tempPath = path.resolve("src/commands/components/init/temp");
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath);
}
process.chdir(tempPath);

const componentGenerationTimeout = 5 * 60 * 1000; // 5 minutes

interface SpecMeta {
  type: "openApi" | "wsdl";
  fileName: string;
  name: string;
}

const specs = fs.readdirSync("../fixtures/specs").map<SpecMeta>((fileName) => {
  const type = fileName.endsWith(".wsdl") ? "wsdl" : "openApi";
  const [name] = fileName.toLowerCase().split(".");
  return { type, fileName, name };
});

describe("component generation tests", () => {
  for (const { type, fileName, name } of specs) {
    describe(`${type} - ${name}`, () => {
      it(
        "should generate successfully",
        async () => {
          const startingCwd = process.cwd();
          expect(startingCwd).toStrictEqual(tempPath);

          await InitializeComponent.run([
            name,
            `--${kebabCase(type)}-path=../fixtures/specs/${fileName}`,
          ]);

          expect(process.cwd()).toStrictEqual(startingCwd);
        },
        componentGenerationTimeout,
      );

      it("should match scaffolding snapshots", async () => {
        // TODO: Bun snapshotting has a bug where it is dropping the slash for `\.ts` in webpack.config.js.
        // Exclude package.json now that we're fetching the latest Spectral version from the registry.
        const targets = await walkDir(name, [".png", "webpack.config.js", "package.json"]);
        for (const target of targets) {
          const contents = await readFile(target, "utf-8");
          expect(contents).toMatchSnapshot(target);
        }
      });
    });
  }
});

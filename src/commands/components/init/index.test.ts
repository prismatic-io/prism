import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { readFile } from "fs-extra";
import { kebabCase } from "lodash-es";
import path from "path";
import { describe, expect, it } from "vitest";
import { walkDir } from "../../../fs";
import { runCommand } from "../../../test-command.js";
import InitializeComponent from ".";

const COMPONENT_GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface SpecMeta {
  type: "openApi" | "wsdl";
  fileName: string;
  name: string;
}

const componentsPath = path.resolve("src/commands/components");
const tempPath = path.resolve(`${componentsPath}/init/temp`);

if (!existsSync(tempPath)) {
  await mkdir(tempPath);
}

const specs = (await readdir(`${componentsPath}/init/fixtures/specs`)).map<SpecMeta>((fileName) => {
  const type = fileName.endsWith(".wsdl") ? "wsdl" : "openApi";
  const [name] = fileName.toLowerCase().split(".");
  return { type, fileName, name };
});

/** The scaffolds components:init produces. `--internal` exists only on the modern toolchain. */
const VARIANTS = [
  { name: "modern", toolchain: "modern", flags: [] },
  { name: "modern + internal", toolchain: "modern", flags: ["--internal"] },
  { name: "legacy", toolchain: "legacy", flags: [] },
] as const;

describe("component generation tests", () => {
  const basePath = process.env.PWD ?? process.cwd();

  it("refuses --internal on the legacy toolchain", async () => {
    process.chdir(tempPath);
    try {
      await expect(
        runCommand(InitializeComponent, ["legacy-internal", "--toolchain", "legacy", "--internal"]),
      ).rejects.toThrow(/only the modern toolchain/);
    } finally {
      process.chdir(basePath);
    }
  });

  // Cases are [title, case] so `%s` names each describe exactly as before (snapshot keys depend on it).
  const cases = VARIANTS.flatMap((variant) =>
    specs.map(({ type, fileName, name }) => {
      const title = `${variant.name} - ${type} - ${name}`;
      const projectName = `${name}-${kebabCase(variant.name)}`;
      return [title, { ...variant, type, fileName, projectName }] as const;
    }),
  );

  describe.each(cases)("%s", (_title, { toolchain, flags, type, fileName, projectName }) => {
    it(
      "should generate successfully",
      async () => {
        process.chdir(tempPath);

        await runCommand(InitializeComponent, [
          projectName,
          `--${kebabCase(type)}-path=../fixtures/specs/${fileName}`,
          "--toolchain",
          toolchain,
          ...flags,
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
        expect(contents).toMatchSnapshot(target.split(path.sep).join("/"));
      }

      process.chdir(basePath);
    });
  });
});

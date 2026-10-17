import { existsSync, existsSync as fileExists } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { readFile } from "fs-extra";
import { kebabCase } from "lodash-es";
import path from "path";
import { describe, expect, it } from "vitest";
import { walkDir } from "../../../fs";
import { HIDDEN_OPTIONS } from "../../../hidden-options.js";
import { runCommand } from "../../../test-command.js";
import InitializeComponent from ".";

const COMPONENT_GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// The scaffolds pin spectral to a release; the snapshots should not move with that pin.
const withoutSpectralRange = (contents: string) =>
  contents.replace(/"@prismatic-io\/spectral": "[^"]+"/g, '"@prismatic-io/spectral": "VERSION"');

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

/** The scaffolds components:init produces. `--prismatic-internal` exists only on the modern toolchain. */
const VARIANTS = [
  { name: "modern", toolchain: "modern", flags: [] },
  { name: "modern + internal", toolchain: "modern", flags: ["--prismatic-internal"] },
  { name: "legacy", toolchain: "legacy", flags: [] },
] as const;

describe("component generation tests", () => {
  const basePath = process.env.PWD ?? process.cwd();

  it("refuses --prismatic-internal on the legacy toolchain", async () => {
    process.chdir(tempPath);
    try {
      await expect(
        runCommand(InitializeComponent, [
          "legacy-internal",
          "--toolchain",
          "legacy",
          "--prismatic-internal",
        ]),
      ).rejects.toThrow(/only the modern toolchain/);
    } finally {
      process.chdir(basePath);
    }
  });

  it("keeps --prismatic-internal out of the options schema, so help, --schema and MCP never list it", () => {
    const options = (
      InitializeComponent as unknown as { options: { shape: Record<string, unknown> } }
    ).options.shape;
    expect(Object.keys(options)).not.toContain("prismatic-internal");
    expect(Object.keys(options)).not.toContain("internal");
    expect(HIDDEN_OPTIONS["components:init"]).toEqual(["prismatic-internal"]);
  });

  describe("a mixed-case name", () => {
    const readJson = async (file: string) => JSON.parse(await readFile(file, "utf-8"));

    it("lowercases the npm package name and keeps the directory as typed", async () => {
      process.chdir(tempPath);
      try {
        await runCommand(InitializeComponent, ["MyComponent"]);
        const pkg = await readJson(path.join(tempPath, "MyComponent", "package.json"));
        expect(pkg).toMatchObject({
          name: "mycomponent",
          private: true,
          main: "./npm-dist/index.cjs",
          types: "./npm-dist/index.d.cts",
          files: ["npm-dist", "dist"],
          prismatic: { component: "./dist/index.js" },
          scripts: { prepare: "npm run build:npm", "publish:platform": expect.any(String) },
          peerDependencies: { "@prismatic-io/spectral": expect.any(String) },
        });
        expect(pkg.scripts.publish).toBeUndefined();
        const readme = await readFile(path.join(tempPath, "MyComponent", "README.md"), "utf-8");
        expect(readme).toContain('"mycomponent": "file:../MyComponent"');
        expect(readme).toContain("myComponent.connections.apiKey(");
        expect(readme).toContain("myComponent.triggers.exampleTrigger(");
        expect(fileExists(path.join(tempPath, "MyComponent", "src", "platform.ts"))).toBe(false);
        expect(fileExists(path.join(tempPath, "MyComponent", "src", "definition.ts"))).toBe(false);
        const source = await readFile(
          path.join(tempPath, "MyComponent", "src", "index.ts"),
          "utf-8",
        );
        expect(source).toContain("export default component({");
        expect(source).not.toContain("callableComponent");
        const connections = await readFile(
          path.join(tempPath, "MyComponent", "src", "connections.ts"),
          "utf-8",
        );
        expect(connections).toContain("export default [acmeApiKey, authorizationCode];");
        expect(pkg.scripts["build:npm"]).toBe("npm run build && node build-npm.mjs");
      } finally {
        process.chdir(basePath);
      }
    });

    it("scopes and lowercases the internal package for public npm publishing", async () => {
      process.chdir(tempPath);
      try {
        await runCommand(InitializeComponent, ["MyInternal", "--prismatic-internal"]);
        const pkg = await readJson(path.join(tempPath, "MyInternal", "package.json"));
        expect(Object.keys(pkg).slice(0, 5)).toEqual([
          "name",
          "version",
          "description",
          "license",
          "repository",
        ]);
        expect(pkg).toMatchObject({
          name: "@prismatic-io/components-myinternal",
          version: "0.0.0",
          repository: { directory: "components/myinternal" },
          files: ["npm-dist", "dist"],
          publishConfig: { access: "public" },
          prismatic: { component: "./dist/index.js" },
          scripts: {
            prepare: "npm run build:npm",
          },
        });
        expect(pkg.private).toBeUndefined();
        expect(pkg.scripts.prepublishOnly).toBeUndefined();
      } finally {
        process.chdir(basePath);
      }
    });
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

      const targets = await walkDir(projectName, [".png", "webpack.config.js"]);
      for (const target of targets) {
        const contents = withoutSpectralRange(await readFile(target, "utf-8"));
        // Soft, so one stale file reports every other mismatch in the scaffold too.
        expect.soft(contents).toMatchSnapshot(target.split(path.sep).join("/"));
      }

      process.chdir(basePath);
    });
  });
});

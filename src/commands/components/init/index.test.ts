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

expect.addSnapshotSerializer({
  test(value) {
    return (
      typeof value === "string" && /"@prismatic-io\/spectral": "(?!VERSION")[^"]+"/.test(value)
    );
  },
  serialize(value: string, config, indentation, depth, refs, printer) {
    const normalized = value.replace(
      /"@prismatic-io\/spectral": "[^"]+"/g,
      '"@prismatic-io/spectral": "VERSION"',
    );

    return printer(normalized, config, indentation, depth, refs);
  },
});

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

// Snapshot each toolchain once; focused tests below cover the internal preset.
const VARIANTS = [
  { name: "modern", toolchain: "modern", flags: [] },
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
      ).rejects.toThrow(/only by the modern toolchain/);
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
          exports: { ".": { types: "./npm-dist/index.d.cts", default: "./npm-dist/index.cjs" } },
          files: ["npm-dist", "dist"],
          prismatic: { component: "./dist/index.js" },
          scripts: { prepare: "npm run build", "publish:platform": expect.any(String) },
          peerDependencies: { "@prismatic-io/spectral": expect.any(String) },
        });
        expect(pkg.scripts.publish).toBeUndefined();

        const readme = await readFile(path.join(tempPath, "MyComponent", "README.md"), "utf-8");

        expect(readme).toContain('Registry publishing is disabled by `"private": true`');
        // How an integration installs the component, and the sample component's entities.
        expect(readme).toContain('"mycomponent": "github:your-org/MyComponent#v1.0.0"');
        expect(readme).toContain('"mycomponent": "file:../MyComponent"');
        expect(readme).toContain("npm run build --workspace mycomponent");
        expect(readme).toContain('import myComponent from "mycomponent";');
        expect(readme).toContain("myComponent.connections.apiKey(");
        expect(readme).toContain("myComponent.dataSources.selectPost(");
        expect(readme).toContain("myComponent.triggers.exampleTrigger(");
        expect(readme).toContain("myComponent.actions.listPosts(");
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
      } finally {
        process.chdir(basePath);
      }
    });

    it.each([
      false,
      true,
    ])("applies internal publishing metadata (OpenAPI: %s)", async (openApi) => {
      process.chdir(tempPath);

      try {
        const name = openApi ? "my-internal-open-api" : "my-internal";

        await runCommand(InitializeComponent, [
          name,
          "--prismatic-internal",
          ...(openApi ? ["--open-api-path", "../fixtures/specs/todo-api.json"] : []),
        ]);

        const pkg = await readJson(path.join(tempPath, name, "package.json"));

        expect(pkg).toMatchObject({
          name: `@prismatic-io/components-${name.toLowerCase()}`,
          version: "0.0.1",
          license: "Apache-2.0",
          repository: {
            type: "git",
            url: "git+https://github.com/prismatic-io/components.git",
            directory: `components/${name}`,
          },
          exports: { ".": { types: "./npm-dist/index.d.cts", default: "./npm-dist/index.cjs" } },
          files: ["npm-dist", "dist"],
          publishConfig: { access: "public" },
          prismatic: { component: "./dist/index.js" },
          scripts: {
            prepare: "npm run build",
          },
        });
        expect(pkg.private).toBeUndefined();
        expect(pkg.scripts.prepublishOnly).toBeUndefined();

        const source = await readFile(path.join(tempPath, name, "src/index.ts"), "utf-8");
        expect(source).toContain("public: true");
        expect(source).toContain(`key: "${name}"`);

        const readme = await readFile(path.join(tempPath, name, "README.md"), "utf-8");
        const packageName = `@prismatic-io/components-${name}`;
        expect(readme.startsWith('<div align="center">')).toBe(true);
        expect(readme).toContain(`<h1>${packageName}</h1>`);
        expect(readme).toContain(`npm install ${packageName}`);
        expect(readme).toContain(
          openApi
            ? `import myInternalOpenApi from "${packageName}";`
            : `import myInternal from "${packageName}";`,
        );
        expect(readme).toContain(`(https://prismatic.io/docs/components/${name}/)`);
        for (const heading of [
          "## What is Prismatic?",
          "## Who uses Prismatic?",
          "## What kind of integrations can you build using Prismatic?",
          "## License",
        ]) {
          expect(readme).toContain(heading);
        }
        expect(readme).toContain("This package is Apache-2.0 licensed.");
        expect(readme).not.toContain("scaffolded by `prism components:init`");
      } finally {
        process.chdir(basePath);
      }
    });
  });

  it.each([
    "@customer/acme",
    "customer-acme",
  ])("enables registry publishing as %s without changing platform visibility", async (packageName) => {
    process.chdir(tempPath);
    const directory = packageName.startsWith("@") ? "ScopedCustomer" : "UnscopedCustomer";

    try {
      await runCommand(InitializeComponent, [directory, "--npm-package", packageName]);

      const pkg = JSON.parse(
        await readFile(path.join(tempPath, directory, "package.json"), "utf-8"),
      );

      expect(pkg.name).toBe(packageName);
      expect(pkg.private).toBeUndefined();
      expect(pkg.publishConfig).toBeUndefined();
      expect(pkg.exports).toEqual({
        ".": { types: "./npm-dist/index.d.cts", default: "./npm-dist/index.cjs" },
      });

      expect(await readFile(path.join(tempPath, directory, "src/index.ts"), "utf-8")).toContain(
        "public: false",
      );

      const readme = await readFile(path.join(tempPath, directory, "README.md"), "utf-8");

      expect(readme).toContain("This package is enabled for registry publishing");
      expect(readme).toContain("writes customer-acme-0.0.1.tgz");
      expect(readme).toContain(`"${packageName}": "file:./vendor/customer-acme-0.0.1.tgz"`);
    } finally {
      process.chdir(basePath);
    }
  });

  it("keys an internal component by its name as given and names the package after it", async () => {
    process.chdir(tempPath);

    try {
      await runCommand(InitializeComponent, ["internal-example", "--prismatic-internal"]);

      const pkg = JSON.parse(
        await readFile(path.join(tempPath, "internal-example/package.json"), "utf-8"),
      );

      expect(pkg.name).toBe("@prismatic-io/components-internal-example");
      expect(pkg.scripts.build).toBe("npm run typecheck && tsdown");
      expect(pkg.publishConfig).toEqual({ access: "public" });

      const source = await readFile(path.join(tempPath, "internal-example/src/index.ts"), "utf-8");

      expect(source).toContain('key: "internal-example"');
      expect(source).toContain("public: true");
    } finally {
      process.chdir(basePath);
    }
  });

  it.each([
    ["--npm-package", "@customer/acme", "--prismatic-internal"],
    ["--npm-package", "@customer/acme", "--toolchain", "legacy"],
    ...[
      "",
      "UpperCase",
      "@scope",
      "@scope/",
      "../escape",
      "has spaces",
      "node_modules",
      "~acme",
      "acme~foo",
      "@scope/~acme",
      "x".repeat(215),
    ].map((name) => ["--npm-package", name]),
  ])("rejects invalid publishing options before creating files: %j", async (...flags) => {
    process.chdir(tempPath);

    try {
      await expect(
        runCommand(InitializeComponent, ["invalid-publishing", ...flags]),
      ).rejects.toThrow();

      expect(fileExists(path.join(tempPath, "invalid-publishing"))).toBe(false);
    } finally {
      process.chdir(basePath);
    }
  });

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
        const contents = await readFile(target, "utf-8");

        expect.soft(contents).toMatchSnapshot(target.split(path.sep).join("/"));
      }

      process.chdir(basePath);
    });
  });
});

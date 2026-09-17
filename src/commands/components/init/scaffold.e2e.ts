import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import fs from "fs";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { TOOLCHAIN_NAMES, type ToolchainName } from "../../../utils/toolchain";
import InitializeIntegration from "../../integrations/init";
import InitializeComponent from ".";

const run = promisify(execFile);

const basePath = process.env.PWD ?? process.cwd();
const tempPath = path.resolve("src/commands/components/init/temp/e2e");
const specsPath = path.resolve("src/commands/components/init/fixtures/specs");

interface ScaffoldCase {
  key: string;
  scaffold: (projectName: string, toolchain: ToolchainName) => Promise<void>;
  lints: (toolchain: ToolchainName) => boolean;
  runsTests: boolean;
  generatesManifest: boolean;
  bundleAssets: string[];
  assertBundle: (bundle: Record<string, unknown>) => void;
}

const initComponent = (flag: string, spec: string) => {
  return (projectName: string, toolchain: ToolchainName) =>
    InitializeComponent.run([
      projectName,
      `--${flag}=${path.join(specsPath, spec)}`,
      "--toolchain",
      toolchain,
    ]);
};

const expectActions = (bundle: Record<string, unknown>): void => {
  const component = bundle as { actions?: Record<string, unknown> };
  expect(Object.keys(component.actions ?? {}).length).toBeGreaterThan(0);
};

const expectCodeNativeIntegration = (bundle: Record<string, unknown>): void => {
  const integration = bundle as { codeNativeIntegrationYAML?: string };
  expect(integration.codeNativeIntegrationYAML).toEqual(expect.any(String));
  expect(integration.codeNativeIntegrationYAML?.length ?? 0).toBeGreaterThan(0);
};

const modernOnly = (toolchain: ToolchainName): boolean => toolchain === "modern";
const never = (): boolean => false;

const cases: ScaffoldCase[] = [
  {
    key: "openapi-todo",
    scaffold: initComponent("open-api-path", "todo-api.json"),
    lints: modernOnly,
    runsTests: false,
    generatesManifest: true,
    bundleAssets: [],
    assertBundle: expectActions,
  },
  {
    key: "openapi-petstore",
    scaffold: initComponent("open-api-path", "petstore-expanded.json"),
    lints: modernOnly,
    runsTests: false,
    generatesManifest: true,
    bundleAssets: [],
    assertBundle: expectActions,
  },
  {
    key: "wsdl-countryinfo",
    scaffold: initComponent("wsdl-path", "CountryInfoService.wsdl"),
    lints: never,
    runsTests: true,
    generatesManifest: true,
    bundleAssets: ["countryInfoService.wsdl"],
    assertBundle: expectActions,
  },
  {
    key: "cni-default",
    scaffold: (projectName, toolchain) =>
      InitializeIntegration.run([projectName, "--toolchain", toolchain]),
    lints: never,
    runsTests: false,
    generatesManifest: false,
    bundleAssets: [],
    assertBundle: expectCodeNativeIntegration,
  },
];

const npm = async (projectRoot: string, ...args: string[]): Promise<void> => {
  try {
    await run("npm", args, { cwd: projectRoot, maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    const { stdout = "", stderr = "" } = error as { stdout?: string; stderr?: string };
    throw new Error(`npm ${args.join(" ")} failed in ${projectRoot}\n${stdout}\n${stderr}`);
  }
};

const loadBundle = (projectRoot: string): Record<string, unknown> => {
  const bundle = createRequire(path.join(projectRoot, "package.json"))(
    path.join(projectRoot, "dist", "index.js"),
  ) as { default?: Record<string, unknown> };
  return bundle.default ?? bundle;
};

describe("generated scaffolds install and build", () => {
  beforeAll(() => {
    fs.rmSync(tempPath, { recursive: true, force: true });
    fs.mkdirSync(tempPath, { recursive: true });
  });

  for (const toolchain of TOOLCHAIN_NAMES) {
    for (const scaffoldCase of cases) {
      const projectName = `${scaffoldCase.key}-${toolchain}`;
      const projectRoot = path.join(tempPath, projectName);

      describe(`${toolchain} - ${scaffoldCase.key}`, () => {
        it("scaffolds", async () => {
          process.chdir(tempPath);
          try {
            await scaffoldCase.scaffold(projectName, toolchain);
          } finally {
            process.chdir(basePath);
          }
          expect(fs.existsSync(path.join(projectRoot, "package.json"))).toBe(true);
        });

        it("installs dependencies", async () => {
          await npm(projectRoot, "install", "--no-audit", "--no-fund");
        });

        it("type checks", async () => {
          await npm(projectRoot, "run", "typecheck");
        });

        it.runIf(scaffoldCase.lints(toolchain))("lints", async () => {
          await npm(projectRoot, "run", "lint");
        });

        it.runIf(scaffoldCase.runsTests)("runs tests", async () => {
          await npm(projectRoot, "test");
        });

        it("builds a loadable bundle", async () => {
          await npm(projectRoot, "run", "build");
          for (const asset of scaffoldCase.bundleAssets) {
            expect(fs.existsSync(path.join(projectRoot, "dist", asset))).toBe(true);
          }
          scaffoldCase.assertBundle(loadBundle(projectRoot));
        });

        it.runIf(scaffoldCase.generatesManifest)("generates a component manifest", async () => {
          await npm(projectRoot, "run", "generate:manifest:dev");
          expect(fs.existsSync(path.join(tempPath, `${projectName}-manifest`))).toBe(true);
        });
      });
    }
  }
});

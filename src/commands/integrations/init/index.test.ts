import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { readFile } from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { walkDir } from "../../../fs.js";
import { runCommand } from "../../../test-command.js";
import { TOOLCHAIN_NAMES } from "../../../utils/toolchain/index.js";
import InitializeIntegration from "./index.js";

const GENERATION_TIMEOUT_SECONDS = 6000; // 1 minute

expect.addSnapshotSerializer({
  test(val) {
    return typeof val === "string";
  },
  serialize(val: string, _config, _indentation, _depth, _refs, _printer) {
    const normalized = val
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "00000000-0000-0000-0000-000000000000",
      )
      .replace(/"@prismatic-io\/spectral": "[^"]+"/, '"@prismatic-io/spectral": "VERSION"');
    return normalized;
  },
});

describe("integrations:init", () => {
  const basePath = process.env.PWD ?? process.cwd();
  const tempPath = path.resolve("src/commands/integrations/init/temp");

  beforeEach(async () => {
    if (!existsSync(tempPath)) {
      await mkdir(tempPath, { recursive: true });
    }
  });

  afterEach(() => {
    process.chdir(basePath);
  });

  it("rejects unsupported configuration types before creating a directory", async () => {
    process.chdir(tempPath);
    await expect(
      runCommand(InitializeIntegration, [
        "invalid-configuration-type",
        "--configuration-type",
        "traditional",
      ]),
    ).rejects.toThrow();
    expect(existsSync("invalid-configuration-type")).toBe(false);
  });

  for (const toolchain of TOOLCHAIN_NAMES) {
    describe(`${toolchain} toolchain`, () => {
      for (const clean of [false, true]) {
        it(`generates headless configuration with clean=${clean}`, async () => {
          const name = `headless-${toolchain}-${clean}`;
          process.chdir(tempPath);
          try {
            await runCommand(InitializeIntegration, [
              name,
              "--toolchain",
              toolchain,
              "--configuration-type",
              "headless",
              ...(clean ? ["--clean"] : []),
            ]);
            const generated = (file: string) => readFile(path.join(tempPath, name, file), "utf-8");
            const index = await generated("src/index.ts");
            const configuration = await generated("src/configuration.ts");
            const augmentation = await generated(".spectral/index.ts");
            const flows = await generated("src/flows.ts");
            const manifest = JSON.parse(await generated("package.json"));
            expect(index).toContain("configuration: integrationConfiguration");
            expect(index).not.toContain("configPages");
            expect(configuration).toContain('version: "1"');
            expect(configuration).toContain("configuration: {}");
            expect(augmentation).not.toContain("Experimental");
            expect(augmentation).toContain("IntegrationDefinitionConfiguration");
            expect(flows).not.toContain("./configPages");
            expect(manifest.dependencies.zod).toBe("^4.0.0");
            expect(existsSync(path.join(tempPath, name, "src/configPages.ts"))).toBe(false);
            expect(process.cwd()).toBe(tempPath);
          } finally {
            await rm(path.join(tempPath, name), { recursive: true, force: true });
          }
        });
      }

      for (const configurationType of ["hosted", "headless"]) {
        for (const clean of [false, true]) {
          for (const includeManifests of [true, false]) {
            it(`generates ${configurationType} with clean=${clean}, includeManifests=${includeManifests}`, async () => {
              const name = `manifests-${toolchain}-${configurationType}-${clean}-${includeManifests}`;
              process.chdir(tempPath);
              try {
                await runCommand(InitializeIntegration, [
                  name,
                  "--toolchain",
                  toolchain,
                  "--configuration-type",
                  configurationType,
                  ...(clean ? ["--clean"] : []),
                  ...(includeManifests ? ["--include-manifests"] : []),
                ]);
                const directory = path.join(tempPath, name);
                expect(existsSync(path.join(directory, "src/componentRegistry.ts"))).toBe(
                  includeManifests,
                );
                const index = await readFile(path.join(directory, "src/index.ts"), "utf-8");
                const augmentation = await readFile(
                  path.join(directory, ".spectral/index.ts"),
                  "utf-8",
                );
                if (includeManifests) {
                  expect(index).toContain("import { componentRegistry }");
                  expect(index).toContain("export { componentRegistry }");
                  expect(index).toContain("  componentRegistry,");
                  expect(augmentation).toContain("IntegrationDefinitionComponentRegistry");
                } else {
                  for (const file of await walkDir(directory, [".png"])) {
                    expect(await readFile(file, "utf-8"), file).not.toMatch(
                      /componentRegistry|ComponentRegistry|componentManifests|ComponentManifest/,
                    );
                  }
                }
              } finally {
                await rm(path.join(tempPath, name), { recursive: true, force: true });
              }
            });
          }
        }
      }

      describe("scaffold generation", () => {
        const integrationName = `test-integration-${toolchain}`;

        afterEach(async () => {
          // Clean up generated directory
          const integrationPath = path.join(tempPath, integrationName);
          if (existsSync(integrationPath)) {
            await rm(integrationPath, { recursive: true, force: true });
          }
        });

        it(
          "should match scaffolding snapshots for default template",
          async () => {
            process.chdir(tempPath);

            await runCommand(InitializeIntegration, [integrationName, "--toolchain", toolchain]);

            // The init command chdir's into the created directory, so go back to tempPath
            process.chdir(tempPath);

            const targets = await walkDir(integrationName, [".png", "webpack.config.js"]);
            for (const target of targets) {
              const contents = await readFile(target, "utf-8");
              expect(contents).toMatchSnapshot(target.split(path.sep).join("/"));
            }
          },
          GENERATION_TIMEOUT_SECONDS,
        );
      });

      describe("clean scaffold generation", () => {
        const cleanIntegrationName = `clean-test-integration-${toolchain}`;

        afterEach(async () => {
          // Clean up generated directory
          const integrationPath = path.join(tempPath, cleanIntegrationName);
          if (existsSync(integrationPath)) {
            await rm(integrationPath, { recursive: true, force: true });
          }
        });

        it(
          "should match scaffolding snapshots for clean template",
          async () => {
            process.chdir(tempPath);

            await runCommand(InitializeIntegration, [
              cleanIntegrationName,
              "--clean",
              "--toolchain",
              toolchain,
            ]);

            // The init command chdir's into the created directory, so go back to tempPath
            process.chdir(tempPath);

            const targets = await walkDir(cleanIntegrationName, [".png", "webpack.config.js"]);
            for (const target of targets) {
              const contents = await readFile(target, "utf-8");
              const snapshotName = `clean-${target}`.split(path.sep).join("/");
              expect(contents).toMatchSnapshot(snapshotName);
            }
          },
          GENERATION_TIMEOUT_SECONDS,
        );
      });
    });
  }
});

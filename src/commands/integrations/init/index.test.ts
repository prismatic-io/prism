import fs from "fs";
import { readFile } from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { walkDir } from "../../../fs.js";
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

  beforeEach(() => {
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
  });

  afterEach(() => {
    process.chdir(basePath);
  });

  it("rejects unsupported configuration types before creating a directory", async () => {
    process.chdir(tempPath);
    const name = "invalid-configuration-type";
    await expect(
      InitializeIntegration.run([name, "--configuration-type", "traditional"]),
    ).rejects.toThrow();
    expect(fs.existsSync(name)).toBe(false);
  });

  for (const toolchain of TOOLCHAIN_NAMES) {
    describe(`${toolchain} toolchain`, () => {
      for (const clean of [false, true]) {
        it(`generates headless configuration with clean=${clean}`, async () => {
          const name = `headless-${toolchain}-${clean}`;
          process.chdir(tempPath);
          try {
            await InitializeIntegration.run([
              name,
              "--toolchain",
              toolchain,
              "--configuration-type",
              "headless",
              ...(clean ? ["--clean"] : []),
            ]);
            const index = await readFile("src/index.ts", "utf-8");
            const configuration = await readFile("src/configuration.ts", "utf-8");
            const augmentation = await readFile(".spectral/index.ts", "utf-8");
            const flows = await readFile("src/flows.ts", "utf-8");
            const manifest = JSON.parse(await readFile("package.json", "utf-8"));
            expect(index).toContain("configuration: integrationConfiguration");
            expect(index).not.toContain("configPages");
            expect(configuration).toContain('version: "1"');
            expect(configuration).toContain("configuration: {}");
            expect(augmentation).not.toContain("Experimental");
            expect(augmentation).toContain("IntegrationDefinitionConfiguration");
            expect(flows).not.toContain("./configPages");
            expect(manifest.dependencies.zod).toBe("^4.0.0");
            expect(fs.existsSync("src/configPages.ts")).toBe(false);
          } finally {
            process.chdir(tempPath);
            fs.rmSync(path.join(tempPath, name), { recursive: true, force: true });
          }
        });
      }

      describe("scaffold generation", () => {
        const integrationName = `test-integration-${toolchain}`;

        afterEach(() => {
          // Clean up generated directory
          const integrationPath = path.join(tempPath, integrationName);
          if (fs.existsSync(integrationPath)) {
            fs.rmSync(integrationPath, { recursive: true, force: true });
          }
        });

        it(
          "should match scaffolding snapshots for default template",
          async () => {
            process.chdir(tempPath);

            await InitializeIntegration.run([integrationName, "--toolchain", toolchain]);

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

        afterEach(() => {
          // Clean up generated directory
          const integrationPath = path.join(tempPath, cleanIntegrationName);
          if (fs.existsSync(integrationPath)) {
            fs.rmSync(integrationPath, { recursive: true, force: true });
          }
        });

        it(
          "should match scaffolding snapshots for clean template",
          async () => {
            process.chdir(tempPath);

            await InitializeIntegration.run([
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

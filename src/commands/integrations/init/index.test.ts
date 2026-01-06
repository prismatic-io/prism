import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import InitializeIntegration from "./index.js";
import { readFile } from "fs-extra";
import { walkDir } from "../../../fs.js";

const GENERATION_TIMEOUT_SECONDS = 6000; // 1 minute

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

  describe("scaffold generation", () => {
    const integrationName = "test-integration";

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

        await InitializeIntegration.run([integrationName]);

        // The init command chdir's into the created directory, so go back to tempPath
        process.chdir(tempPath);

        const targets = await walkDir(integrationName, [".png", "webpack.config.js"]);
        for (const target of targets) {
          const contents = await readFile(target, "utf-8");
          // Normalize generated UUIDs and spectral version in snapshots to make them stable
          const normalizedContents = contents
            .replace(
              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
              "00000000-0000-0000-0000-000000000000",
            )
            .replace(
              /"@prismatic-io\/spectral": "\d+\.\d+\.\d+"/,
              '"@prismatic-io/spectral": "VERSION"',
            );
          expect(normalizedContents).toMatchSnapshot(target);
        }
      },
      GENERATION_TIMEOUT_SECONDS,
    );
  });

  describe("clean scaffold generation", () => {
    const cleanIntegrationName = "clean-test-integration";

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

        await InitializeIntegration.run([cleanIntegrationName, "--clean"]);

        // The init command chdir's into the created directory, so go back to tempPath
        process.chdir(tempPath);

        const targets = await walkDir(cleanIntegrationName, [".png", "webpack.config.js"]);
        for (const target of targets) {
          const contents = await readFile(target, "utf-8");
          // Normalize generated UUIDs and spectral version in snapshots to make them stable
          const normalizedContents = contents
            .replace(
              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
              "00000000-0000-0000-0000-000000000000",
            )
            .replace(
              /"@prismatic-io\/spectral": "\d+\.\d+\.\d+"/,
              '"@prismatic-io/spectral": "VERSION"',
            );
          expect(normalizedContents).toMatchSnapshot(`clean-${target}`);
        }
      },
      GENERATION_TIMEOUT_SECONDS,
    );
  });
});

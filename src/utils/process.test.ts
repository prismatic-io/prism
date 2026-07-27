import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { spawnProcess } from "./process.js";

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(path.join(tmpdir(), "prism-process-test-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("spawnProcess", () => {
  it("resolves when the process exits successfully", async () => {
    await expect(spawnProcess([process.execPath, "--version"], {})).resolves.toBeUndefined();
  });

  it("runs an npm package script by its bare executable name", async () => {
    const directory = await createTemporaryDirectory();
    const outputPath = path.join(directory, "npm-result.json");
    const fixtureDirectory = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "fixtures",
      "npm-package",
    );
    const originalDirectory = process.cwd();

    try {
      process.chdir(fixtureDirectory);
      await spawnProcess(
        ["npm", "run", "process-smoke", "--", "value with spaces & shell | metacharacters"],
        {
          PRISM_PROCESS_TEST_ENV: "expected environment value",
          PRISM_PROCESS_TEST_OUTPUT: outputPath,
        },
      );
    } finally {
      process.chdir(originalDirectory);
    }

    await expect(readFile(outputPath, "utf8")).resolves.toBe(
      JSON.stringify({
        argument: "value with spaces & shell | metacharacters",
        environment: "expected environment value",
      }),
    );
  });

  it("reports a failing npm package script's exit code", async () => {
    const fixtureDirectory = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "fixtures",
      "npm-package",
    );
    const originalDirectory = process.cwd();

    try {
      process.chdir(fixtureDirectory);
      await expect(spawnProcess(["npm", "run", "process-failure"], {})).rejects.toThrow(
        /failed with exit code 19/,
      );
    } finally {
      process.chdir(originalDirectory);
    }
  });

  it("rejects with the command and exit code for a non-zero exit", async () => {
    await expect(spawnProcess([process.execPath, "-e", "process.exit(17)"], {})).rejects.toThrow(
      /failed with exit code 17/,
    );
  });

  it("rejects with a readable error when the executable cannot be started", async () => {
    await expect(spawnProcess(["prism-command-that-does-not-exist"], {})).rejects.toThrowError(
      "prism-command-that-does-not-exist",
    );
  });

  it("rejects an empty command", async () => {
    await expect(spawnProcess([], {})).rejects.toThrow("No command was provided.");
  });

  it.runIf(process.platform === "win32")(
    "runs a .cmd executable discovered through PATH",
    async () => {
      const fixtureDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
      const pathKey =
        Object.keys(process.env).find((key) => key.toLowerCase() === "path") ?? "PATH";

      await expect(
        spawnProcess(["prism-process-smoke", "expected"], {
          [pathKey]: `${fixtureDirectory}${path.delimiter}${process.env[pathKey] ?? ""}`,
        }),
      ).resolves.toBeUndefined();
    },
  );
});

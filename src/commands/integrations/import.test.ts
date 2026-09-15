import { afterEach, describe, expect, it, vi } from "vitest";
import * as diagnostics from "../../command.js";
import { runCommand } from "../../test-command.js";
import type { ComponentDefinition } from "../../utils/component/index.js";
import * as prompts from "../../utils/prompts.js";
import ImportCommand from "./import.js";

vi.mock(import("../../fs.js"), () => ({
  exists: vi.fn(),
  fs: {
    readFile: vi.fn(),
  },
}));

vi.mock(import("../../utils/integration/import.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    importYamlIntegration: vi.fn(() => Promise.resolve("imported-integration-id")),
    importCodeNativeIntegration: vi.fn(() =>
      Promise.resolve({ integrationId: "imported-cni-id", componentId: "comp_1" }),
    ),
    getIntegrationDefinition: vi.fn(() =>
      Promise.resolve(`
configPages:
  - elements:
      - value: "existingVar"
`),
    ),
    extractYAMLFromPath: vi.fn(() =>
      Promise.resolve(`
configPages:
  - elements:
      - value: "existingVar"
`),
    ),
    loadCodeNativeIntegrationEntryPoint: vi.fn(() =>
      Promise.resolve({
        integrationDefinition: `
configPages:
  - elements:
      - value: "existingVar"
`,
        componentDefinition: {} as unknown as ComponentDefinition,
      }),
    ),
  };
});

vi.mock(import("../../utils/integration/open.js"), () => ({
  openIntegration: vi.fn(() => Promise.resolve()),
}));

const mockWaitForComponentVersion = vi.fn();

vi.mock(import("../../utils/availability.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    waitForComponentVersion: (...args: unknown[]) => mockWaitForComponentVersion(...args),
  };
});

describe("ImportCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockWaitForComponentVersion.mockReset();
  });

  describe("replace flow with config var warnings", () => {
    it("should warn and prompt when replacing removes config vars", async () => {
      const { exists } = await import("../../fs.js");
      vi.mocked(exists).mockResolvedValue(true);

      const { getIntegrationDefinition, extractYAMLFromPath } = await import(
        "../../utils/integration/import.js"
      );

      // Existing integration has a var that the new one doesn't
      vi.mocked(getIntegrationDefinition).mockResolvedValue(`
configPages:
  - elements:
      - value: "existingVar"
      - value: "missingVar"
`);

      vi.mocked(extractYAMLFromPath).mockResolvedValue(`
configPages:
  - elements:
      - value: "existingVar"
`);

      const warnSpy = vi.spyOn(diagnostics, "writeCommandOutput").mockImplementation(() => {});
      const confirmSpy = vi.spyOn(prompts, "confirm").mockResolvedValue(false);

      await expect(
        runCommand(ImportCommand, ["--path", "/valid/path.yaml", "-i", "existing-id", "--replace"]),
      ).rejects.toThrow(/Import canceled/);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("missingVar"), "stderr");
      expect(confirmSpy).toHaveBeenCalled();
    });
  });

  describe("Code Native import", () => {
    it("imports the definition and then waits for the package to finish processing", async () => {
      const { importCodeNativeIntegration } = await import("../../utils/integration/import.js");
      mockWaitForComponentVersion.mockResolvedValue(true);
      const logSpy = vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      const result = await runCommand(ImportCommand, []);

      expect(importCodeNativeIntegration).toHaveBeenCalledWith(undefined, false, undefined);
      expect(logSpy).toHaveBeenCalledWith("imported-cni-id");
      expect(mockWaitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 300 });
      expect(result).toEqual({ integrationId: "imported-cni-id" });
    });

    it("should pass test API keys to Code Native import", async () => {
      const { importCodeNativeIntegration } = await import("../../utils/integration/import.js");
      mockWaitForComponentVersion.mockResolvedValue(true);
      vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      await runCommand(ImportCommand, ["--test-api-key", 'myFlow="key123"']);

      expect(importCodeNativeIntegration).toHaveBeenCalledWith(undefined, false, [
        'myFlow="key123"',
      ]);
    });

    it("returns as soon as the definition is imported with --no-wait", async () => {
      vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      const result = await runCommand(ImportCommand, ["--no-wait"]);

      expect(mockWaitForComponentVersion).not.toHaveBeenCalled();
      expect(result).toEqual({ integrationId: "imported-cni-id" });
    });

    it("passes a custom wait timeout to the package wait", async () => {
      mockWaitForComponentVersion.mockResolvedValue(true);
      vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      await runCommand(ImportCommand, ["--wait-timeout", "45"]);

      expect(mockWaitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 45 });
    });

    it("reports the import as complete when the package is still processing after the timeout", async () => {
      mockWaitForComponentVersion.mockResolvedValue(false);
      const logSpy = vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      await expect(runCommand(ImportCommand, ["--wait-timeout", "5"])).rejects.toMatchObject({
        code: "WAIT_TIMEOUT",
        message: expect.stringMatching(
          /integration was imported but its package is still processing after 5 seconds/,
        ),
        cta: {
          commands: [expect.objectContaining({ args: { integration: "imported-cni-id" } })],
        },
      });
      expect(logSpy).toHaveBeenCalledWith("imported-cni-id");
    });

    it("does not wait for YAML imports", async () => {
      const { exists } = await import("../../fs.js");
      vi.mocked(exists).mockResolvedValue(true);
      vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      const result = await runCommand(ImportCommand, ["--path", "/valid/path.yaml"]);

      expect(mockWaitForComponentVersion).not.toHaveBeenCalled();
      expect(result).toEqual({ integrationId: "imported-integration-id" });
    });
  });

  describe("open flag", () => {
    it("should open integration in designer when open flag is provided", async () => {
      const { exists } = await import("../../fs.js");
      vi.mocked(exists).mockResolvedValue(true);

      const { openIntegration } = await import("../../utils/integration/open.js");
      vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

      await runCommand(ImportCommand, ["--path", "/valid/path.yaml", "--open"]);

      expect(openIntegration).toHaveBeenCalledWith("imported-integration-id");
    });
  });
});

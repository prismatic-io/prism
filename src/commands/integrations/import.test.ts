import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import ImportCommand from "./import.js";
import { ux } from "@oclif/core";
import { ComponentDefinition } from "../../utils/component/index.js";

vi.mock("../../fs.js", () => ({
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
    importCodeNativeIntegration: vi.fn(() => Promise.resolve("imported-cni-id")),
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

vi.mock("../../utils/integration/open.js", () => ({
  openIntegration: vi.fn(() => Promise.resolve()),
}));

const server = setupServer();

describe("ImportCommand", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
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

      const warnSpy = vi
        .spyOn(ImportCommand.prototype, "warn")
        .mockImplementation((input: string | Error) => input);
      const confirmSpy = vi.spyOn(ux, "confirm").mockResolvedValue(false);

      await expect(
        ImportCommand.run(["--path", "/valid/path.yaml", "-i", "existing-id", "--replace"]),
      ).rejects.toThrow(/Import canceled/);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("missingVar"));
      expect(confirmSpy).toHaveBeenCalled();
    });
  });

  describe("Code Native import", () => {
    it("should import Code Native integration when no path is provided", async () => {
      const { importCodeNativeIntegration } = await import("../../utils/integration/import.js");
      const logSpy = vi.spyOn(ImportCommand.prototype, "log").mockImplementation(() => {});

      await ImportCommand.run([]);

      expect(importCodeNativeIntegration).toHaveBeenCalledWith(undefined, false, undefined);
      expect(logSpy).toHaveBeenCalledWith("imported-cni-id");
    });

    it("should pass test API keys to Code Native import", async () => {
      const { importCodeNativeIntegration } = await import("../../utils/integration/import.js");
      vi.spyOn(ImportCommand.prototype, "log").mockImplementation(() => {});

      await ImportCommand.run(["--test-api-key", 'myFlow="key123"']);

      expect(importCodeNativeIntegration).toHaveBeenCalledWith(undefined, false, [
        'myFlow="key123"',
      ]);
    });
  });

  describe("open flag", () => {
    it("should open integration in designer when open flag is provided", async () => {
      const { exists } = await import("../../fs.js");
      vi.mocked(exists).mockResolvedValue(true);

      const { openIntegration } = await import("../../utils/integration/open.js");
      vi.spyOn(ImportCommand.prototype, "log").mockImplementation(() => {});

      await ImportCommand.run(["--path", "/valid/path.yaml", "--open"]);

      expect(openIntegration).toHaveBeenCalledWith("imported-integration-id");
    });
  });
});

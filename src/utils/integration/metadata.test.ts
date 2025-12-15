import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPrismMetadata, writePrismMetadata } from "./metadata.js";

const mockExists = vi.fn();
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

vi.mock("../../fs.js", () => ({
  exists: (...args: unknown[]) => mockExists(...args),
  fs: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
  },
}));

describe("metadata utils", () => {
  const originalEnv = { ...process.env };
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRISM_QUIET = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getPrismMetadata", () => {
    it("should return empty object when metadata file does not exist", async () => {
      mockExists.mockResolvedValue(false);

      const result = await getPrismMetadata();

      expect(result).toEqual({});
      expect(mockExists).toHaveBeenCalledWith("./.spectral/prism.json");
    });

    it("should return parsed metadata when file exists", async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue(JSON.stringify({ integrationId: "int-123" }));

      const result = await getPrismMetadata();

      expect(result).toEqual({ integrationId: "int-123" });
    });

    it("should use prefix for dist mode", async () => {
      mockExists.mockResolvedValue(false);

      await getPrismMetadata({ fromDist: true });

      expect(mockExists).toHaveBeenCalledWith("../.spectral/prism.json");
    });

    it("should return empty object and warn when JSON parsing fails", async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue("invalid json{");

      const result = await getPrismMetadata();

      expect(result).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("writePrismMetadata", () => {
    it("should write metadata to file", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      await writePrismMetadata({ integrationId: "int-123" });

      expect(mockWriteFile).toHaveBeenCalledWith(
        "./.spectral/prism.json",
        JSON.stringify({ integrationId: "int-123" }),
      );
    });

    it("should use prefix for dist mode", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      await writePrismMetadata({ integrationId: "int-123" }, { fromDist: true });

      expect(mockWriteFile).toHaveBeenCalledWith(
        "../.spectral/prism.json",
        JSON.stringify({ integrationId: "int-123" }),
      );
    });

    it("should not warn when file already exists", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);
      process.env.PRISM_QUIET = undefined;

      await writePrismMetadata({ integrationId: "int-123" });

      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("metadata file has been added"),
      );
    });
  });
});

import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrismMetadata, writePrismMetadata } from "./metadata.js";

const mockExists = vi.fn();
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

vi.mock(import("../../fs.js"), () => ({
  exists: (...args: unknown[]) => mockExists(...args),
  fs: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
  },
}));

describe("metadata utils", () => {
  const projectDirectory = path.resolve("/tmp/prism-metadata-project");
  const metadataPath = path.join(projectDirectory, ".spectral", "prism.json");
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("PRISM_QUIET", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getPrismMetadata", () => {
    it("should return empty object when metadata file does not exist", async () => {
      mockExists.mockResolvedValue(false);

      const result = await getPrismMetadata({ cwd: projectDirectory });

      expect(result).toEqual({});
      expect(mockExists).toHaveBeenCalledWith(metadataPath);
    });

    it("should return parsed metadata when file exists", async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue(JSON.stringify({ integrationId: "int-123" }));

      const result = await getPrismMetadata({ cwd: projectDirectory });

      expect(result).toEqual({ integrationId: "int-123" });
    });

    it("resolves dist metadata against its explicit project directory", async () => {
      mockExists.mockResolvedValue(false);

      await getPrismMetadata({ fromDist: true, cwd: path.join(projectDirectory, "dist") });

      expect(mockExists).toHaveBeenCalledWith(metadataPath);
    });

    it("should return empty object and warn when JSON parsing fails", async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue("invalid json{");

      const result = await getPrismMetadata({ cwd: projectDirectory });

      expect(result).toEqual({});
      expect(stderrSpy).toHaveBeenCalled();
    });
  });

  describe("writePrismMetadata", () => {
    it("should write metadata to file", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      await writePrismMetadata({ integrationId: "int-123" }, { cwd: projectDirectory });

      expect(mockWriteFile).toHaveBeenCalledWith(
        metadataPath,
        JSON.stringify({ integrationId: "int-123" }),
      );
    });

    it("resolves dist metadata against its explicit project directory", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      await writePrismMetadata(
        { integrationId: "int-123" },
        { fromDist: true, cwd: path.join(projectDirectory, "dist") },
      );

      expect(mockWriteFile).toHaveBeenCalledWith(
        metadataPath,
        JSON.stringify({ integrationId: "int-123" }),
      );
    });

    it("should not warn when file already exists", async () => {
      mockExists.mockResolvedValue(true);
      mockWriteFile.mockResolvedValue(undefined);
      delete process.env.PRISM_QUIET;

      await writePrismMetadata({ integrationId: "int-123" }, { cwd: projectDirectory });

      expect(stderrSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("metadata file has been added"),
      );
    });
  });
});

it("keeps concurrent metadata reads associated with their explicit project directories", async () => {
  const alpha = path.resolve("/tmp/prism-alpha");
  const beta = path.resolve("/tmp/prism-beta");
  mockExists.mockResolvedValue(true);
  mockReadFile.mockImplementation(async (file: string) =>
    JSON.stringify({ integrationId: file.startsWith(alpha) ? "alpha-id" : "beta-id" }),
  );
  await expect(
    Promise.all([
      getPrismMetadata({ cwd: path.join(alpha, "dist"), fromDist: true }),
      getPrismMetadata({ cwd: beta }),
    ]),
  ).resolves.toEqual([{ integrationId: "alpha-id" }, { integrationId: "beta-id" }]);
});

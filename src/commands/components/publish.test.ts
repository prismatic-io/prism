import { afterEach, describe, expect, it, vi } from "vitest";
import * as diagnostics from "../../command.js";
import { runCommand } from "../../test-command.js";
import PublishCommand from "./publish.js";

const mockWaitForComponentVersion = vi.fn();
const mockPublishDefinition = vi.fn();

vi.mock(import("../../utils/user/query.js"), () => ({
  whoAmI: vi.fn(() => Promise.resolve({ customer: null })),
}));

vi.mock(import("../../utils/import.js"), () => ({
  getPackageEntrypointDirectory: vi.fn(() => Promise.resolve("/component/dist")),
}));

vi.mock(import("../../command-context.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    withWorkingDirectory: <T>(_directory: string, callback: () => Promise<T>) => callback(),
  };
});

vi.mock(import("../../utils/component/index.js"), () => ({
  loadEntrypoint: vi.fn(() =>
    Promise.resolve({
      key: "example",
      display: { label: "Example", description: "An example component" },
    }),
  ),
  validateDefinition: vi.fn(() => Promise.resolve()),
  createComponentPackage: vi.fn(() => Promise.resolve("/component/package.zip")),
  createSourceCodePackage: vi.fn(() => Promise.resolve("/component/source.zip")),
}));

vi.mock(import("../../utils/component/publish.js"), () => ({
  checkPackageSignature: vi.fn(() => Promise.resolve(false)),
  confirmPublish: vi.fn(() => Promise.resolve(true)),
  publishDefinition: (...args: unknown[]) => mockPublishDefinition(...args),
  uploadConnectionIcons: vi.fn(() => Promise.resolve()),
  uploadFile: vi.fn(() => Promise.resolve()),
}));

vi.mock(import("../../utils/availability.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    waitForComponentVersion: (...args: unknown[]) => mockWaitForComponentVersion(...args),
  };
});

describe("components publish", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockWaitForComponentVersion.mockReset();
    mockPublishDefinition.mockReset();
  });

  const mockSubmitted = () =>
    mockPublishDefinition.mockResolvedValue({
      componentId: "comp_1",
      iconUploadUrl: "https://upload.example/icon",
      packageUploadUrl: "https://upload.example/package",
      connectionIconUploadUrls: {},
      versionNumber: 7,
    });

  it("waits for the published version to become available", async () => {
    mockSubmitted();
    mockWaitForComponentVersion.mockResolvedValue(true);
    const statusSpy = vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

    const result = await runCommand(PublishCommand, []);

    expect(mockWaitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 300 });
    expect(result).toEqual({
      componentId: "comp_1",
      label: "Example",
      versionNumber: 7,
      available: true,
    });
    expect(statusSpy).toHaveBeenCalledWith("Successfully published Example (v7)!");
  });

  it("returns as soon as the publish is submitted with --no-wait", async () => {
    mockSubmitted();
    vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

    const result = await runCommand(PublishCommand, ["--no-wait"]);

    expect(mockWaitForComponentVersion).not.toHaveBeenCalled();
    expect(result).toEqual({
      componentId: "comp_1",
      label: "Example",
      versionNumber: 7,
      available: false,
    });
  });

  it("fails when the version is still processing after the timeout", async () => {
    mockSubmitted();
    mockWaitForComponentVersion.mockResolvedValue(false);
    vi.spyOn(diagnostics, "writeCommandStatus").mockImplementation(() => {});

    await expect(runCommand(PublishCommand, ["--wait-timeout", "10"])).rejects.toThrow(
      /Example \(v7\) was submitted but is still processing after 10 seconds/,
    );
    expect(mockWaitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 10 });
  });
});

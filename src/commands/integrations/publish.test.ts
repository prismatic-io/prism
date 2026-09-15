import { afterEach, describe, expect, it, vi } from "vitest";
import { runCommand } from "../../test-command.js";
import PublishCommand from "./publish.js";

const mockGqlRequest = vi.fn();
const mockWaitForIntegrationVersion = vi.fn();

vi.mock(import("../../graphql.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    gqlRequest: (...args: unknown[]) => mockGqlRequest(...args),
  };
});

vi.mock(import("../../utils/availability.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    waitForIntegrationVersion: (...args: unknown[]) => mockWaitForIntegrationVersion(...args),
  };
});

const operationName = (call: unknown[]) =>
  (call[0] as { document: { definitions: Array<{ name: { value: string } }> } }).document
    .definitions[0].name.value;

const mockPlatform = () =>
  mockGqlRequest.mockImplementation(({ document }) => {
    const name = document.definitions[0].name.value;
    if (name === "integrationDraftVersion") {
      return Promise.resolve({ integration: { id: "int_1", versionNumber: 4 } });
    }
    if (name === "publishIntegration") {
      return Promise.resolve({ publishIntegration: { integration: { id: "int_1" }, errors: [] } });
    }
    throw new Error(`Unexpected operation ${name}`);
  });

describe("integrations publish", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockGqlRequest.mockReset();
    mockWaitForIntegrationVersion.mockReset();
  });

  it("publishes and waits for the new version to become available", async () => {
    mockPlatform();
    mockWaitForIntegrationVersion.mockResolvedValue(true);

    const result = await runCommand(PublishCommand, ["int_1", "--comment", "release"]);

    expect(mockGqlRequest.mock.calls.map(operationName)).toEqual([
      "integrationDraftVersion",
      "publishIntegration",
    ]);
    expect(mockGqlRequest.mock.calls[1][0].variables).toMatchObject({
      id: "int_1",
      comment: "release",
    });
    expect(mockWaitForIntegrationVersion).toHaveBeenCalledWith("int_1", 4, {
      timeoutSeconds: 300,
    });
    expect(result).toEqual({ integrationId: "int_1", versionNumber: 4, available: true });
    expect(PublishCommand.output.safeParse(result).success).toBe(true);
  });

  it("passes a custom timeout to the wait", async () => {
    mockPlatform();
    mockWaitForIntegrationVersion.mockResolvedValue(true);

    await runCommand(PublishCommand, ["int_1", "--wait-timeout", "30"]);

    expect(mockWaitForIntegrationVersion).toHaveBeenCalledWith("int_1", 4, { timeoutSeconds: 30 });
  });

  it("returns without waiting when --no-wait is provided", async () => {
    mockPlatform();

    const result = await runCommand(PublishCommand, ["int_1", "--no-wait"]);

    expect(mockWaitForIntegrationVersion).not.toHaveBeenCalled();
    expect(result).toEqual({ integrationId: "int_1", versionNumber: 4, available: false });
  });

  it("fails when the version is still processing after the timeout", async () => {
    mockPlatform();
    mockWaitForIntegrationVersion.mockResolvedValue(false);

    await expect(runCommand(PublishCommand, ["int_1", "--wait-timeout", "5"])).rejects.toThrow(
      /still processing after 5 seconds/,
    );
  });

  it("fails when the integration does not exist", async () => {
    mockGqlRequest.mockResolvedValue({ integration: null });

    await expect(runCommand(PublishCommand, ["missing"])).rejects.toThrow(/Integration not found/);
    expect(mockGqlRequest).toHaveBeenCalledTimes(1);
  });
});

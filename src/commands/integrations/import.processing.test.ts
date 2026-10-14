import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentVersionAvailabilityDocument } from "../../graphql/operations/componentVersionAvailability.generated.js";
import { ImportIntegrationDocument } from "../../graphql/operations/importIntegration.generated.js";
import { IntegrationImportAvailabilityDocument } from "../../graphql/operations/integrationImportAvailability.generated.js";
import { runCommand } from "../../test-command.js";
import ImportCommand from "./import.js";

const state = vi.hoisted(() => ({
  directory: "",
  upload: vi.fn(),
  gql: vi.fn(),
  writeMetadata: vi.fn(),
}));

// Keep the real polling loop, but put its promise-based sleep on Vitest's clock.
vi.mock(import("node:timers/promises"), async (original) => ({
  ...(await original()),
  setTimeout: <T = void>(delay = 0, value?: T) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(value as T), delay)),
}));
vi.mock(import("../../utils/import.js"), async (original) => ({
  ...(await original()),
  getPackageEntrypointDirectory: async () => state.directory,
}));
vi.mock(import("../../utils/component/index.js"), async (original) => ({
  ...(await original()),
  validateDefinition: vi.fn(),
  createComponentPackage: async () => "/package.zip",
}));
vi.mock(import("../../utils/component/publish.js"), async (original) => ({
  ...(await original()),
  publishDefinition: async () => ({
    componentId: "component-version-7",
    versionNumber: 7,
    packageUploadUrl: "https://upload.example/package",
    iconUploadUrl: "https://upload.example/icon",
    connectionIconUploadUrls: {},
  }),
  uploadFile: (...args: unknown[]) => state.upload(...args),
  uploadConnectionIcons: vi.fn(),
}));
vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: (...args: unknown[]) => state.gql(...args),
}));
vi.mock(import("../../utils/integration/metadata.js"), async (original) => ({
  ...(await original()),
  getPrismMetadata: async () => ({}),
  writePrismMetadata: (...args: unknown[]) => state.writeMetadata(...args),
}));

beforeEach(async () => {
  state.directory = await mkdtemp(join(tmpdir(), "prism-cni-processing-"));
  await writeFile(
    join(state.directory, "index.js"),
    `module.exports = { default: { key: "cni-key", display: {},
      actions: { execute: { perform: () => {} } },
      codeNativeIntegrationYAML: ${JSON.stringify(
        JSON.stringify({
          isCodeNative: true,
          flows: [
            {
              name: "Test",
              steps: [
                {
                  isTrigger: true,
                  action: { key: "webhook", component: { key: "webhook-triggers" } },
                },
                { action: { key: "execute", component: { key: "cni-key" } } },
              ],
            },
          ],
        }),
      )} } };`,
  );
  state.upload.mockReset().mockResolvedValue(undefined);
  state.gql.mockReset();
  state.writeMetadata.mockReset();
  vi.useFakeTimers();
});

afterEach(async () => {
  vi.useRealTimers();
  await rm(state.directory, { recursive: true, force: true });
});

function emulateProcessing(readyAfterMs: number, integrationReadyAfterMs = 0) {
  let importedAt: number | undefined;
  const uploadedAt = Date.now();
  const events: string[] = [];
  let firstPoll!: () => void;
  const started = new Promise<void>((resolve) => {
    firstPoll = resolve;
  });
  state.upload.mockImplementation(async () => {
    events.push("upload");
  });
  state.gql.mockImplementation(async ({ document, variables }) => {
    if (document === ComponentVersionAvailabilityDocument) {
      expect(variables).toEqual({ id: "component-version-7" });
      expect(events[0]).toBe("upload");
      const available = Date.now() - uploadedAt >= readyAfterMs;
      events.push(available ? "available" : "processing");
      firstPoll();
      // Unavailable component versions can be hidden by the API entirely.
      return {
        component:
          available || events.length % 2 === 0
            ? { id: variables.id, versionIsAvailable: available }
            : null,
      };
    }
    if (document === ImportIntegrationDocument) {
      importedAt = Date.now();
      events.push("import");
      expect(events.at(-2)).toBe("available");
      expect(Date.now() - uploadedAt).toBeGreaterThanOrEqual(readyAfterMs);
      return {
        importIntegration: {
          integration: {
            id: "integration-1",
            testConfigVariables: { nodes: [] },
            systemInstance: { id: "instance-1", flowConfigs: { nodes: [] } },
          },
        },
      };
    }
    if (document === IntegrationImportAvailabilityDocument) {
      expect(variables).toEqual({ integrationId: "integration-1" });
      expect(importedAt).toBeDefined();
      const ready = Date.now() - (importedAt ?? Date.now()) >= integrationReadyAfterMs;
      events.push(ready ? "integration-ready" : "integration-processing");
      return {
        integration: {
          versionNumber: 4,
          systemInstance: {
            lastDeployedAt: ready ? "2026-09-30T00:00:00Z" : null,
            deployedVersion: ready ? 4 : 3,
            needsDeploy: !ready,
          },
        },
      };
    }
    throw new Error("Unexpected GraphQL request");
  });
  return { events, started };
}

describe("Code Native import waits for component publication", () => {
  it.each([
    { flags: [], timeout: 180, processingMs: 120_000 },
    { flags: ["--no-wait"], timeout: 600, processingMs: 360_000 },
  ])("does not import during a $processingMs ms publish with $flags", async ({
    flags,
    timeout,
    processingMs,
  }) => {
    const { events, started } = emulateProcessing(processingMs);
    const pending = runCommand(ImportCommand, [...flags, "--wait-timeout", String(timeout)]);
    const completed = pending.then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    await Promise.race([started, completed]);
    await vi.advanceTimersByTimeAsync(processingMs - 2000);

    expect(events.filter((event) => event === "processing")).toHaveLength(processingMs / 2000);
    expect(events).not.toContain("import");
    expect(state.writeMetadata).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2000);
    expect(await completed).toEqual({
      value: { integrationId: "integration-1", componentId: "component-version-7" },
    });
    expect(events.slice(events.indexOf("available"))).toEqual(
      flags.includes("--no-wait")
        ? ["available", "import"]
        : ["available", "import", "integration-ready"],
    );
    expect(events.filter((event) => event === "import")).toHaveLength(1);
    expect(events.filter((event) => event === "available")).toHaveLength(1);
    expect(state.writeMetadata).toHaveBeenCalledWith(
      { integrationId: "integration-1" },
      { fromDist: true },
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    { flags: [] },
    { flags: ["--no-wait"] },
  ])("does not import when publication exceeds the timeout with %j", async ({ flags }) => {
    const { events, started } = emulateProcessing(120_000);
    const pending = runCommand(ImportCommand, [...flags, "--wait-timeout", "45"]);
    const completed = pending.then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    await Promise.race([started, completed]);
    await vi.advanceTimersByTimeAsync(45_000);
    expect(await completed).toMatchObject({
      error: {
        code: "COMMAND_FAILED",
        message: expect.stringContaining("after 45 seconds, so the definition was not imported"),
      },
    });

    expect(events.filter((event) => event === "processing").length).toBeGreaterThan(20);
    expect(events).not.toContain("import");
    expect(state.writeMetadata).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("optional integration import readiness", () => {
  it.each([
    { flags: [] },
    { flags: ["--wait"] },
  ])("waits for the integration after the mandatory component wait with $flags", async ({
    flags,
  }) => {
    const { events, started } = emulateProcessing(120_000, 120_000);
    let settled = false;
    const completed = runCommand(ImportCommand, [...flags, "--wait-timeout", "180"]).then(
      (value) => {
        settled = true;
        return { value };
      },
      (error: unknown) => {
        settled = true;
        return { error };
      },
    );
    await Promise.race([started, completed]);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(events).toContain("import");
    expect(events).toContain("integration-processing");
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(118_000);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(await completed).toEqual({
      value: { integrationId: "integration-1", componentId: "component-version-7" },
    });
    expect(events.at(-1)).toBe("integration-ready");
    expect(events.filter((event) => event === "available")).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("skips integration readiness with --no-wait but still waits for the component", async () => {
    const { events, started } = emulateProcessing(120_000, Infinity);
    const completed = runCommand(ImportCommand, ["--no-wait"]).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    await Promise.race([started, completed]);
    await vi.advanceTimersByTimeAsync(118_000);
    expect(events).not.toContain("import");
    await vi.advanceTimersByTimeAsync(2000);
    expect(await completed).toEqual({
      value: { integrationId: "integration-1", componentId: "component-version-7" },
    });
    expect(events.slice(-2)).toEqual(["available", "import"]);
    expect(events).not.toContain("integration-processing");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports that import succeeded when only integration readiness times out", async () => {
    const { events, started } = emulateProcessing(2000, Infinity);
    const completed = runCommand(ImportCommand, ["--wait-timeout", "45"]).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    await Promise.race([started, completed]);
    await vi.advanceTimersByTimeAsync(47_000);
    expect(await completed).toMatchObject({
      error: {
        code: "WAIT_TIMEOUT",
        message: expect.stringContaining(
          "integration was imported but its test instance is not ready after 45 seconds",
        ),
      },
    });
    expect(events.filter((event) => event === "import")).toHaveLength(1);
    expect(state.writeMetadata).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

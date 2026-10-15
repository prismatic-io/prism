import { print } from "graphql";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentDefinition } from "./index.js";
import { findPublishedVersion, publishDefinition } from "./publish.js";

const gqlRequest = vi.hoisted(() => vi.fn());
const waitForComponentVersion = vi.hoisted(() => vi.fn());

vi.mock("../../graphql.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../graphql.js")>()),
  gqlRequest,
}));
vi.mock("../availability.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../availability.js")>()),
  waitForComponentVersion,
}));
vi.mock("../../fs.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../fs.js")>()),
  fs: { readFile: async () => Buffer.from("package bytes") },
}));

const definition = {
  key: "test",
  display: { label: "Test", description: "Test component" },
  actions: {},
  triggers: {},
  dataSources: {},
  connections: [],
} as ComponentDefinition;

describe("publishDefinition", () => {
  beforeEach(() => {
    gqlRequest.mockReset();
    gqlRequest.mockResolvedValue({
      publishComponent: {
        publishResult: {
          component: { id: "component-id", versionNumber: 1 },
          iconUploadUrl: "https://example.com/icon",
          packageUploadUrl: "https://example.com/package",
          connectionIconUploadUrls: [],
          connectionAvatarIconUploadUrls: [],
        },
      },
    });
  });

  it("publishes initializer prerequisites and server function definitions", async () => {
    const serverFunctions = [{ key: "inspect", connections: ["instance.api"] }];
    await publishDefinition({
      ...definition,
      configurationInit: { connections: ["instance.api"] },
      serverFunctionDefinitions: serverFunctions,
    });

    const { document, variables } = gqlRequest.mock.calls[0][0];
    expect(print(document)).toContain("$serverFunctions: [ServerFunctionDefinitionInput]");
    expect(variables.definition).toMatchObject({
      configurationInit: { connections: ["instance.api"] },
    });
    expect(variables.definition).not.toHaveProperty("hasConfigurationInit");
    expect(variables.definition).not.toHaveProperty("serverFunctionDefinitions");
    expect(variables.serverFunctions).toEqual(serverFunctions);
  });

  it("does not invent initializer or server functions for ordinary components", async () => {
    await publishDefinition(definition);

    const { variables } = gqlRequest.mock.calls[0][0];
    expect(variables.definition).not.toHaveProperty("configurationInit");
    expect(variables.definition).not.toHaveProperty("hasConfigurationInit");
    expect(variables.serverFunctions).toBeUndefined();
  });
});

describe("findPublishedVersion", () => {
  const version = (versionNumber: number, versionIsAvailable: boolean, signature = "sig") => ({
    id: `comp_${versionNumber}`,
    signature,
    versionNumber,
    versionIsAvailable,
  });
  const respond = (...pages: Array<Array<ReturnType<typeof version>>>) => {
    gqlRequest.mockReset();
    for (const nodes of pages) gqlRequest.mockResolvedValueOnce({ components: { nodes } });
  };

  beforeEach(() => {
    waitForComponentVersion.mockReset();
  });

  it("resolves the highest available version whose signature matches, across all versions", async () => {
    respond([version(2, true), version(5, true), version(6, false)]);

    await expect(findPublishedVersion(definition, "/tmp/package.zip")).resolves.toEqual({
      versionNumber: 5,
    });
    const { variables } = gqlRequest.mock.calls[0][0];
    expect(variables).toMatchObject({ key: "test", public: false, allVersions: true });
    expect(variables.signature).toMatch(/^[0-9a-f]{40}$/);
  });

  it("is undefined when no available version matches and nothing is in flight", async () => {
    respond([], [version(3, true)]);

    await expect(
      findPublishedVersion(definition, "/tmp/package.zip", { timeoutSeconds: 1 }),
    ).resolves.toBeUndefined();
    expect(waitForComponentVersion).not.toHaveBeenCalled();
  });

  it("waits out a version still processing, then looks again", async () => {
    // First lookup: nothing matches yet, the latest row is a clone that hasn't been hashed.
    // After the platform finishes, the same lookup finds it.
    respond([], [version(4, false, "previous")], [version(4, true)]);
    waitForComponentVersion.mockResolvedValue(true);

    await expect(
      findPublishedVersion(definition, "/tmp/package.zip", { timeoutSeconds: 30 }),
    ).resolves.toEqual({ versionNumber: 4 });
    expect(waitForComponentVersion).toHaveBeenCalledWith("comp_4", { timeoutSeconds: 30 });
  });

  it("does not wait without wait options", async () => {
    respond([], [version(4, false, "previous")]);

    await expect(findPublishedVersion(definition, "/tmp/package.zip")).resolves.toBeUndefined();
    expect(waitForComponentVersion).not.toHaveBeenCalled();
    expect(gqlRequest).toHaveBeenCalledTimes(1);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentDefinition } from "./index.js";
import { publishDefinition } from "./publish.js";

const gqlRequest = vi.hoisted(() => vi.fn());

vi.mock("../../graphql.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../graphql.js")>()),
  gqlRequest,
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
          component: { versionNumber: "1" },
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
      hasConfigurationInit: true,
      configurationInit: { connections: ["instance.api"] },
      serverFunctionDefinitions: serverFunctions,
    });

    const { document, variables } = gqlRequest.mock.calls[0][0];
    expect(document).toContain("$serverFunctions: [ServerFunctionDefinitionInput]");
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

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { print } from "graphql";
import { temporaryDirectoryTask } from "tempy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withWorkingDirectory } from "../../command-context.js";
import type { ComponentDefinition } from "./index.js";
import { publishDefinition, uploadComponentVersion } from "./publish.js";

const gqlRequest = vi.hoisted(() => vi.fn());
const fetch = vi.hoisted(() => vi.fn());

vi.mock("../../graphql.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../graphql.js")>()),
  gqlRequest,
}));
vi.mock("../http.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../http.js")>()),
  fetch,
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

describe("uploadComponentVersion", () => {
  beforeEach(() => {
    gqlRequest.mockReset();
    fetch.mockReset();
    fetch.mockResolvedValue({ ok: true });
    gqlRequest.mockResolvedValue({
      publishComponent: {
        publishResult: {
          component: { id: "component-id", versionNumber: 5 },
          iconUploadUrl: "https://example.com/icon",
          packageUploadUrl: "https://example.com/package",
          sourceUploadUrl: "https://example.com/source",
          connectionIconUploadUrls: [],
          connectionAvatarIconUploadUrls: [],
        },
      },
    });
  });

  it("publishes, then uploads the package, the icon from the working directory, and the source", async () => {
    await temporaryDirectoryTask(async (dir) => {
      await mkdir(dir, { recursive: true });
      for (const file of ["package.zip", "icon.png", "source.zip"]) {
        await writeFile(path.join(dir, file), file);
      }

      const result = await withWorkingDirectory(dir, () =>
        uploadComponentVersion(
          { ...definition, display: { ...definition.display, iconPath: "icon.png" } },
          path.join(dir, "package.zip"),
          { comment: "from a test", sourceCodePath: path.join(dir, "source.zip") },
        ),
      );

      expect(result).toEqual({ componentId: "component-id", versionNumber: 5 });
      expect(gqlRequest.mock.calls[0][0].variables).toMatchObject({ comment: "from a test" });
      expect(fetch.mock.calls.map(([url]) => url)).toEqual([
        "https://example.com/package",
        "https://example.com/icon",
        "https://example.com/source",
      ]);
      expect(String(fetch.mock.calls[1][1].body)).toBe("icon.png");
    });
  });
});

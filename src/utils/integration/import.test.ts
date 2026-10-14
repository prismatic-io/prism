import { writeFile } from "node:fs/promises";
import path from "node:path";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, it, vi } from "vitest";
import { dumpYaml } from "../serialize.js";
import {
  compareConfigVars,
  getIntegrationDefinition,
  importDefinition,
  loadCodeNativeIntegrationEntryPoint,
  parseTestApiKeys,
} from "./import.js";

const mockGqlRequest = vi.fn();
vi.mock(import("../../graphql.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    gqlRequest: (...args: unknown[]) => mockGqlRequest(...args),
  };
});

describe("importDefinition", () => {
  it("should throw when the server response omits the integration", async () => {
    mockGqlRequest.mockResolvedValueOnce({ importIntegration: { integration: null, errors: [] } });
    await expect(importDefinition("definition")).rejects.toThrow("Failed to import integration");
  });
});

describe("loadCodeNativeIntegrationEntryPoint", () => {
  it("should error when the entrypoint lacks a Code Native Integration definition", async () => {
    const originalCwd = process.cwd();
    await temporaryDirectoryTask(async (tmpDir) => {
      await writeFile(path.join(tmpDir, "index.js"), "module.exports = { default: {} };");
      process.chdir(tmpDir);
      try {
        await expect(loadCodeNativeIntegrationEntryPoint()).rejects.toThrow(
          /Failed to find Code Native Integration definition/,
        );
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

describe("compareConfigVars", () => {
  const configuration = {
    instance: { schema: { type: "object" }, version: "instance-v1" },
    userLevel: { schema: { type: "object" }, version: "user-v1" },
  };
  const instanceConnection = { key: "instance.api", dataType: "connection" };
  const userConnection = { key: "userLevel.api", dataType: "connection" };
  const legacyPages = [{ elements: [{ type: "configVar", value: instanceConnection.key }] }];

  it.each([
    {
      name: "scoped configuration without pages or config vars",
      current: { configuration },
      next: { configuration },
      missing: [],
    },
    {
      name: "unchanged scoped connection declarations",
      current: { configuration, requiredConfigVars: [instanceConnection, userConnection] },
      next: { configuration, requiredConfigVars: [instanceConnection, userConnection] },
      missing: [],
    },
    {
      name: "removed user-level connection declaration",
      current: { configuration, requiredConfigVars: [instanceConnection, userConnection] },
      next: { configuration, requiredConfigVars: [instanceConnection] },
      missing: [userConnection.key],
    },
    {
      name: "additional scoped connection declarations",
      current: { configuration, requiredConfigVars: [instanceConnection] },
      next: { configuration, requiredConfigVars: [instanceConnection, userConnection] },
      missing: [],
    },
    {
      name: "legacy pages replaced by scoped configuration",
      current: { configPages: legacyPages },
      next: { configuration, requiredConfigVars: [instanceConnection] },
      missing: [],
    },
    {
      name: "scoped configuration replaced by legacy pages",
      current: { configuration, requiredConfigVars: [instanceConnection] },
      next: { configPages: legacyPages },
      missing: [],
    },
    {
      name: "removed declared connection not represented on a legacy page",
      current: {
        configPages: legacyPages,
        requiredConfigVars: [instanceConnection, userConnection],
      },
      next: { configPages: legacyPages, requiredConfigVars: [instanceConnection] },
      missing: [userConnection.key],
    },
    {
      name: "an explicitly empty declaration list",
      current: { configPages: legacyPages, requiredConfigVars: [] },
      next: { configuration },
      missing: [],
    },
  ])("compares $name", async ({ current, next, missing }) => {
    await expect(compareConfigVars(dumpYaml(current), dumpYaml(next))).resolves.toEqual(missing);
  });

  it.each([
    ["", "name: Next"],
    ["name: Current", ""],
  ])("rejects an empty definition", async (current, next) => {
    await expect(compareConfigVars(current, next)).rejects.toThrow(
      "Cannot compare config vars against an empty integration definition.",
    );
  });
  it("should correctly identify missing config vars", async () => {
    const originalYAML = `
      configPages:
        - elements:
            - value: "configVar1"
            - value: "missingVar"
    `;

    const newYAML = `
      configPages:
        - elements:
            - value: "configVar1"
    `;

    const missingVars = await compareConfigVars(originalYAML, newYAML);
    expect(missingVars).toEqual(["missingVar"]);
  });
});

describe("parseTestApiKeys", () => {
  it("should parse simple flow name without quotes", () => {
    const result = parseTestApiKeys(['simpleFlow="key123"']);
    expect(result).toEqual({ simpleFlow: ["key123"] });
  });

  it("should parse flow name with spaces using quotes", () => {
    const result = parseTestApiKeys(['"List Items"="key456"']);
    expect(result).toEqual({ "List Items": ["key456"] });
  });

  it("should parse multiple keys for the same flow", () => {
    const result = parseTestApiKeys(['myFlow="key1"', 'myFlow="key2"']);
    expect(result).toEqual({ myFlow: ["key1", "key2"] });
  });

  it("should parse mixed quoted and unquoted flow names", () => {
    const result = parseTestApiKeys(['simpleFlow="key1"', '"Flow With Spaces"="key2"']);
    expect(result).toEqual({
      simpleFlow: ["key1"],
      "Flow With Spaces": ["key2"],
    });
  });

  it("should throw error for empty API key", () => {
    expect(() => parseTestApiKeys(['flowName=""'])).toThrow(
      'Empty API key provided for provider "flowName"',
    );
  });

  it("should throw error for invalid format without quotes", () => {
    expect(() => parseTestApiKeys(["invalid format"])).toThrow(/Invalid --test-api-key format/);
  });

  it("should throw error for invalid format with spaces and no quotes", () => {
    expect(() => parseTestApiKeys(['Flow Name="key"'])).toThrow(/Invalid --test-api-key format/);
  });

  it("should throw error for missing API key part", () => {
    expect(() => parseTestApiKeys(["flowName"])).toThrow(/Invalid --test-api-key format/);
  });
});

it.each([
  null,
  { definition: null },
  { definition: "" },
])("rejects unavailable integration definitions: %j", async (integration) => {
  mockGqlRequest.mockResolvedValueOnce({ integration });
  await expect(getIntegrationDefinition("integration-id")).rejects.toThrow(
    "Integration not found: integration-id",
  );
});

it("returns the integration definition unchanged", async () => {
  const definition = "name: Example\nconfigPages: []\n";
  mockGqlRequest.mockResolvedValueOnce({ integration: { definition } });
  await expect(getIntegrationDefinition("integration-id")).resolves.toBe(definition);
});

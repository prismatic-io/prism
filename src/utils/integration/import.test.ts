import { describe, it, expect } from "bun:test";
import { compareConfigVars, parseTestApiKeys } from "./import.js";

describe("compareConfigVars", () => {
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

import { describe, it, expect } from "vitest";
import { parseData } from "./stepResults.js";

describe("parseData", () => {
  describe("null/undefined handling", () => {
    it("should return empty string for null", () => {
      expect(parseData(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(parseData(undefined)).toBe("");
    });
  });

  describe("JSON content type", () => {
    it("should parse valid JSON string", () => {
      const jsonString = '{"key": "value"}';
      const result = parseData(Buffer.from(jsonString), "application/json");
      expect(result).toEqual({ key: "value" });
    });

    it("should throw error for malformed JSON", () => {
      const malformedJson = '{"key": invalid}';
      expect(() => parseData(Buffer.from(malformedJson), "application/json")).toThrow(
        "Received malformed JSON payload.",
      );
    });

    it("should handle JSON arrays", () => {
      const jsonArray = "[1, 2, 3]";
      const result = parseData(Buffer.from(jsonArray), "application/json");
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("other content types", () => {
    it("should passthrough non-JSON data", () => {
      const textData = "Hello, World!";
      expect(parseData(textData, "text/plain")).toBe(textData);

      const htmlData = "<html><body>Test</body></html>";
      expect(parseData(htmlData, "text/html")).toBe(htmlData);

      const csvData = "a,b,c\n1,2,3";
      expect(parseData(csvData, "text/csv")).toBe(csvData);

      const xmlData = "<root><item>value</item></root>";
      expect(parseData(xmlData, "application/xml")).toBe(xmlData);

      const binaryData = Buffer.from([0x00, 0x01, 0x02]);
      expect(parseData(binaryData, "binary/octet-stream")).toEqual(binaryData);
    });

    it("should stringify objects without recognized content type", () => {
      const objectData = { key: "value" };
      const result = parseData(objectData, "");
      expect(result).toBe('{"key":"value"}');
    });
  });
});

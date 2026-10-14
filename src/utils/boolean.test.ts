import { describe, expect, it } from "vitest";
import { parseOptionalBoolean } from "./boolean.js";

describe("parseOptionalBoolean", () => {
  it("preserves omitted values", () => {
    expect(parseOptionalBoolean(undefined)).toBeUndefined();
  });

  it.each([
    ["true", true],
    ["false", false],
  ] as const)("parses %s as %s", (value, expected) => {
    expect(parseOptionalBoolean(value)).toBe(expected);
  });

  it.each(["", "TRUE", "False", "1", "0", "yes", " true "])("rejects %j", (value) => {
    expect(() => parseOptionalBoolean(value)).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { cleanIdentifier, isIdentifier } from "./identifier.js";

describe("isIdentifier", () => {
  it.each(["slack", "googleDrive", "_private", "$ref", "v2Api"])("accepts %s", (name) => {
    expect(isIdentifier(name)).toBe(true);
  });

  it.each([
    "3cx",
    "google-drive",
    "delete",
    "class",
    "new",
    "",
    "with space",
  ])("rejects %s", (name) => {
    expect(isIdentifier(name)).toBe(false);
  });
});

describe("cleanIdentifier", () => {
  it.each([
    { value: "foo/bar", expected: "fooBar" },
    { value: ",foo_bar", expected: "fooBar" },
    { value: "12345foobar", expected: "one2345Foobar" },
    { value: "0", expected: "zero" },
    { value: "default", expected: "defaultValue" },
    { value: "case", expected: "aCase" },
    { value: "Default", expected: "defaultValue" },
    { value: "delete", expected: "deleteValue" },
    { value: "DELETE", expected: "deleteValue" },
    { value: "new", expected: "newValue" },
    { value: "class", expected: "classValue" },
  ])("produces a usable identifier for $value", ({ value, expected }) => {
    expect(cleanIdentifier(value)).toStrictEqual(expected);
    expect(isIdentifier(cleanIdentifier(value))).toBe(true);
  });
});

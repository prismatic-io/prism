import { describe, expect, it } from "vitest";
import { createDescription } from "./utils.js";

describe("createDescription", () => {
  it.each([{ value: "Bob's", expected: "Bob's" }])("should not flip quotes", ({
    value,
    expected,
  }) => {
    expect(createDescription(value)).toStrictEqual(expected);
  });
});

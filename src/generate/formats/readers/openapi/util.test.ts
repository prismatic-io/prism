import { describe, it, expect } from "vitest";
import { toGroupTag } from "./util";

describe("toGroupTag", () => {
  it.each([
    {
      input: "/",
      expected: "root",
    },
    {
      input: "/users/{id}",
      expected: "users",
    },
    {
      input: "External ID",
      expected: "externalId",
    },
  ])("handles reasonable path or tag inputs", ({ input, expected }) => {
    expect(toGroupTag(input)).toStrictEqual(expected);
  });

  it.each([
    {
      input: "/17",
      expected: "a17",
    },
    {
      input: "/82dbb5d5-b5fb-47ea-b3dc-1748750470e2/{id}",
      expected: "a82Dbb5D5B5Fb47EaB3Dc1748750470E2",
    },
    {
      input: "1. Users",
      expected: "a1Users",
    },
  ])("handles inputs producing invalid import names", ({ input, expected }) => {
    expect(toGroupTag(input)).toStrictEqual(expected);
  });
});

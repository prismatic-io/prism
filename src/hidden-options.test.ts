import { describe, expect, it } from "vitest";
import { extractHiddenOptions, hiddenOption, runWithHiddenOptions } from "./hidden-options.js";

describe("extractHiddenOptions", () => {
  it("removes the named flags before a -- delimiter and reports the ones set", () => {
    expect(
      extractHiddenOptions(
        ["components", "init", "x", "--prismatic-internal", "--yes", "--", "--prismatic-internal"],
        ["prismatic-internal"],
      ),
    ).toEqual({
      argv: ["components", "init", "x", "--yes", "--", "--prismatic-internal"],
      set: new Set(["prismatic-internal"]),
    });
  });

  it("lets the last occurrence determine the value", () => {
    expect(
      extractHiddenOptions(
        ["--prismatic-internal", "--prismatic-internal=false"],
        ["prismatic-internal"],
      ).set.size,
    ).toBe(0);

    expect(
      extractHiddenOptions(
        ["--prismatic-internal=false", "--prismatic-internal=true"],
        ["prismatic-internal"],
      ).set.has("prismatic-internal"),
    ).toBe(true);
  });

  it("reads an explicit =false as unset and leaves other flags alone", () => {
    const { argv, set } = extractHiddenOptions(
      ["init", "--prismatic-internal=false", "--internal"],
      ["prismatic-internal"],
    );

    expect(argv).toEqual(["init", "--internal"]);
    expect(set.size).toBe(0);
  });
});

describe("hiddenOption", () => {
  it("is scoped to the run it was set for", async () => {
    expect(hiddenOption("prismatic-internal")).toBe(false);

    await runWithHiddenOptions(new Set(["prismatic-internal"]), async () => {
      await Promise.resolve();

      expect(hiddenOption("prismatic-internal")).toBe(true);
    });

    expect(hiddenOption("prismatic-internal")).toBe(false);
  });
});

import { describe, it, expect } from "bun:test";
import { compareConfigVars } from "./import.js";

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

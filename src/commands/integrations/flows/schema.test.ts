import { describe, expect, it } from "vitest";
import { listenFlagsSchema } from "./listen.js";
import { testFlagsSchema } from "./test.js";

describe("native streaming input schemas", () => {
  it.each([
    { "flow-id": "flow", "flow-name": "named" },
    { "flow-id": "flow", "flow-url": "https://example.test/flow" },
    { "flow-name": "named", "flow-url": "https://example.test/flow" },
  ])("rejects conflicting test selectors before execution: %j", (selectors) => {
    expect(testFlagsSchema.safeParse(selectors).success).toBe(false);
  });

  it("validates listening selectors without a command adapter", () => {
    expect(
      listenFlagsSchema.safeParse({
        "integration-id": "integration",
        "flow-id": "flow",
        "flow-name": "named",
      }).success,
    ).toBe(false);
    expect(
      listenFlagsSchema.parse({ "integration-id": "integration", "flow-name": "named" }),
    ).toMatchObject({ "flow-name": "named", timeout: 1200, output: "./payloads" });
  });

  it.each([
    "tail-logs",
    "tail-results",
  ])("retains the conditional schema rules with --%s", (tail) => {
    expect(testFlagsSchema.safeParse({ "result-file": "results.json" }).success).toBe(false);
    expect(testFlagsSchema.safeParse({ "result-file": "results.json", [tail]: true }).success).toBe(
      true,
    );
  });
});

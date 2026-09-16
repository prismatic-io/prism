import { describe, expect, it } from "vitest";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { optionalConditions, parseWhere, toFilterGroups } from "./filters.js";

describe("parseWhere", () => {
  it.each([
    ["status=error", { keyPath: "status", operator: FilterOperator.Eq, value: "error" }],
    ["flowName!=Sync", { keyPath: "flowName", operator: FilterOperator.NotEq, value: "Sync" }],
    ["error~timeout", { keyPath: "error", operator: FilterOperator.Contains, value: "timeout" }],
    [
      "instanceName^=Acme",
      { keyPath: "instanceName", operator: FilterOperator.StartsWith, value: "Acme" },
    ],
    [
      "endedAt>=2026-09-01",
      { keyPath: "endedAt", operator: FilterOperator.Gte, value: "2026-09-01" },
    ],
    [
      "retryAttemptNumber<=2",
      { keyPath: "retryAttemptNumber", operator: FilterOperator.Lte, value: 2 },
    ],
    ["error=null", { keyPath: "error", operator: FilterOperator.IsNull, value: true }],
    ["error!=null", { keyPath: "error", operator: FilterOperator.IsNull, value: false }],
    ["isReplay=true", { keyPath: "isReplay", operator: FilterOperator.Eq, value: true }],
    [
      "triggerPayload.order.id=12345",
      { keyPath: "triggerPayload.order.id", operator: FilterOperator.Eq, value: "12345" },
    ],
    [
      "status in error, canceled",
      { keyPath: "status", operator: FilterOperator.In, value: ["error", "canceled"] },
    ],
  ])("parses %s", (expression, expected) => {
    expect(parseWhere(expression)).toEqual(expected);
  });

  it("keeps a value that contains an operator character", () => {
    expect(parseWhere("message~a=b")).toEqual({
      keyPath: "message",
      operator: FilterOperator.Contains,
      value: "a=b",
    });
  });

  it("rejects expressions without an operator or value", () => {
    expect(() => parseWhere("nonsense")).toThrowError(
      expect.objectContaining({ code: "INVALID_FILTER" }),
    );
    expect(() => parseWhere("status=")).toThrowError(
      expect.objectContaining({ code: "INVALID_FILTER" }),
    );
  });
});

describe("toFilterGroups", () => {
  it("sends null instead of an empty group", () => {
    expect(toFilterGroups([])).toBeNull();
  });
});

describe("optionalConditions", () => {
  it("keeps only the entries that carry a value", () => {
    expect(
      optionalConditions([
        ["status", FilterOperator.Eq, "error"],
        ["resultType", FilterOperator.Eq, undefined],
        ["error", FilterOperator.Contains, ""],
        ["hasError", FilterOperator.Eq, false],
        ["retryAttemptNumber", FilterOperator.Eq, 0],
      ]),
    ).toEqual([
      { keyPath: "status", operator: FilterOperator.Eq, value: "error" },
      { keyPath: "retryAttemptNumber", operator: FilterOperator.Eq, value: 0 },
    ]);
  });
});

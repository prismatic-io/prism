import { describe, expect, it } from "vitest";
import { getStderr, getStdout } from "../vitest.setup.js";
import { instanceEventText, integrationEventText } from "./human-output.js";

describe("human execution output", () => {
  it("prints the response and legacy execution label without a native event envelope", () => {
    expect(
      integrationEventText({ type: "execution", executionId: "execution-id", response: "success" }),
    ).toBe('Execution ID: execution-id\n\n"success"\n');
    expect(
      integrationEventText({
        type: "execution",
        executionId: "execution-id",
        response: { executionId: "execution-id" },
      }),
    ).toBe('{\n  "executionId": "execution-id"\n}\n');
  });
  it("retains unwrapped JSONL log and step-result records", () => {
    const log = {
      timestamp: "2026-10-13T00:00:00Z",
      severity: "INFO",
      message: "Hello",
      sectionId: null,
      sectionName: null,
    };
    expect(
      integrationEventText({ type: "log", executionId: "execution-id", data: log }, true),
    ).toBe(JSON.stringify(log));
    const step = { endedAt: "2026-10-13T00:00:00Z", stepName: "First", result: { data: 42 } };
    expect(
      integrationEventText({ type: "step-result", executionId: "execution-id", data: step }, true),
    ).toBe(JSON.stringify(step));
  });
  it("keeps section labels in human logs", () => {
    integrationEventText({
      type: "log",
      executionId: "execution-id",
      data: { timestamp: "now", severity: "INFO", message: "Hello", sectionName: "Fetch" },
    });
    expect(getStdout()).toContain("LOG_INFO");
    expect(getStdout()).toContain("[Fetch] Hello");
    expect(getStdout()).not.toContain("execution-id");
  });
  it("retains instance warnings and selected log columns", () => {
    instanceEventText({ type: "warning", message: "Section labels unavailable" });
    expect(getStderr()).toContain("Section labels unavailable");
    instanceEventText(
      { type: "log", executionId: "execution-id", data: { message: "Hello" } },
      "message",
    );
    expect(getStdout().trim()).toBe("Hello");
  });
  it("keeps instance submission and completion silent", () => {
    expect(instanceEventText({ type: "execution", executionId: "execution-id" })).toBeUndefined();
    expect(
      instanceEventText({ type: "completed", executionId: "execution-id", status: "submitted" }),
    ).toBeUndefined();
    expect(getStdout()).toBe("");
  });
});

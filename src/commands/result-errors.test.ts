import { describe, expect, it, vi } from "vitest";
import { serve } from "../cli.js";
import { gqlRequest } from "../graphql.js";

vi.mock(import("../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

async function invoke(argv: string[]) {
  const writes: string[] = [];
  const previousExit = process.exitCode;
  const stdout = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    writes.push(String(chunk));
    return true;
  });
  try {
    process.exitCode = undefined;
    await serve([...argv, "--agent", "--yes", "--json", "--full-output"]);
    return { result: JSON.parse(writes.join("")), exitCode: process.exitCode ?? 0 };
  } finally {
    stdout.mockRestore();
    process.exitCode = previousExit;
  }
}

describe("operation result failures", () => {
  it.each([
    ["missing payload", {}],
    ["null payload", { deployInstance: null }],
    ["null resource", { deployInstance: { instance: null } }],
    ["missing ID", { deployInstance: { instance: {} } }],
  ])("reports %s as execution failure", async (_name, response) => {
    vi.mocked(gqlRequest).mockResolvedValue(response);
    const { result, exitCode } = await invoke(["instances", "deploy", "instance-1"]);
    expect(exitCode).toBe(1);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "COMMAND_FAILED", message: "Instance was not deployed", retryable: false },
    });
    expect(gqlRequest).toHaveBeenCalledOnce();
  });

  it("still rejects missing input before executing the operation", async () => {
    const { result, exitCode } = await invoke(["instances", "deploy"]);
    expect(exitCode).toBe(2);
    expect(result).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(gqlRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["missing workflow", { workflow: null }, "NOT_FOUND", "Workflow not found"],
    [
      "missing definition",
      { workflow: { definition: null } },
      "COMMAND_FAILED",
      "Workflow has no definition",
    ],
  ])("distinguishes %s", async (_name, response, code, message) => {
    vi.mocked(gqlRequest).mockResolvedValue(response);
    const { result, exitCode } = await invoke(["workflows", "export", "workflow-1"]);
    expect(exitCode).toBe(1);
    expect(result).toMatchObject({ ok: false, error: { code, message, retryable: false } });
  });

  it("reports a failed GraphQL request as execution failure", async () => {
    vi.mocked(gqlRequest).mockRejectedValueOnce(new Error("Service unavailable"));
    const { result, exitCode } = await invoke(["graphql", "query", "query { viewer { id } }"]);
    expect(exitCode).toBe(1);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "COMMAND_FAILED", retryable: false },
    });
  });

  it("projects alert event fields from the generated query result", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({
      alertEvents: {
        nodes: [
          {
            id: "event-1",
            createdAt: "2026-09-15T18:00:00Z",
            details: "Alert details",
            monitor: { name: "Monitor" },
          },
        ],
      },
    });
    const { result, exitCode } = await invoke(["alerts", "events", "list", "monitor-1"]);
    expect(exitCode).toBe(0);
    expect(result).toMatchObject({
      ok: true,
      data: {
        items: [
          {
            id: "event-1",
            createdAt: "2026-09-15T18:00:00Z",
            details: "Alert details",
            name: "Monitor",
          },
        ],
      },
    });
  });
});

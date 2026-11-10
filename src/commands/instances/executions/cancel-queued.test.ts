import { describe, expect, it, vi } from "vitest";
import { cli } from "../../../cli.js";
import { gqlRequest } from "../../../graphql.js";

vi.mock(import("../../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

async function invoke(argv: string[]) {
  const writes: string[] = [];
  let exitCode = 0;
  await cli.serve([...argv, "--agent", "--json", "--full-output"], {
    stdout: (value) => writes.push(value),
    exit: (code) => {
      exitCode = code;
    },
  });
  return { result: JSON.parse(writes.join("")), exitCode };
}

describe("instances executions cancel-queued", () => {
  it("cancels the queued executions of the instance", async () => {
    const instanceId = "instance-1";
    vi.mocked(gqlRequest).mockResolvedValue({
      cancelAllQueuedExecutionsForInstance: { instance: { id: instanceId }, errors: [] },
    });
    const { result, exitCode } = await invoke([
      "instances",
      "executions",
      "cancel-queued",
      instanceId,
      "--yes",
    ]);
    expect(exitCode).toBe(0);
    expect(result.data).toEqual({ instanceId });
    expect(gqlRequest).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: instanceId } }),
    );
    expect(result.meta.cta.commands[0].command).toContain(
      `executions list --instance ${instanceId}`,
    );
  });

  it("requires confirmation in agent mode", async () => {
    const { result, exitCode } = await invoke([
      "instances",
      "executions",
      "cancel-queued",
      "instance-1",
    ]);
    expect(exitCode).toBe(2);
    expect(result).toMatchObject({ ok: false, error: { code: "CONFIRMATION_REQUIRED" } });
    expect(gqlRequest).not.toHaveBeenCalled();
  });

  it("reports a missing instance as a failure", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({
      cancelAllQueuedExecutionsForInstance: { instance: null, errors: [] },
    });
    const { result, exitCode } = await invoke([
      "instances",
      "executions",
      "cancel-queued",
      "instance-1",
      "--yes",
    ]);
    expect(exitCode).toBe(1);
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "COMMAND_FAILED",
        message: "Queued executions of the instance were not canceled",
      },
    });
  });
});

import { expect, it, vi } from "vitest";
import { withAuthOperation } from "./operation.js";

it("does not start an already cancelled operation", async () => {
  const run = vi.fn();
  await expect(withAuthOperation(AbortSignal.abort(new Error("cancelled")), run)).rejects.toThrow(
    "cancelled",
  );
  expect(run).not.toHaveBeenCalled();
});

it("aborts work at the auth deadline and clears its timer", async () => {
  vi.useFakeTimers();
  try {
    let signal!: AbortSignal;
    const result = withAuthOperation(undefined, async (operationSignal) => {
      signal = operationSignal;
      return new Promise<never>(() => {});
    });
    const rejected = expect(result).rejects.toThrow("Authentication timed out after 3 minutes.");
    await vi.advanceTimersByTimeAsync(180000);
    await rejected;
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

it("removes the deadline after success or failure", async () => {
  vi.useFakeTimers();
  try {
    await expect(withAuthOperation(undefined, async () => "done")).resolves.toBe("done");
    await expect(
      withAuthOperation(undefined, async () => {
        throw new Error("failed");
      }),
    ).rejects.toThrow("failed");
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

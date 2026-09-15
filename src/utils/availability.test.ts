import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isComponentVersionAvailable,
  isIntegrationVersionAvailable,
  pollUntil,
  resolveWaitOptions,
  waitForComponentVersion,
  waitForIntegrationVersion,
  waitOptions,
  waitTimeout,
} from "./availability.js";

const mockGqlRequest = vi.fn();

vi.mock(import("../graphql.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    gqlRequest: (...args: unknown[]) => mockGqlRequest(...args),
  };
});

const fast = { timeoutSeconds: 1, intervalMs: 1 };

describe("waitOptions", () => {
  it("describes both options in terms of the awaited outcome", () => {
    const options = waitOptions({ until: "the thing is ready", otherwise: "the work is queued" });

    expect(options.wait.description).toBe(
      "Wait until the thing is ready (use --no-wait to return as soon as the work is queued)",
    );
    expect(options["wait-timeout"].description).toBe("Seconds to wait until the thing is ready");
    expect(options.wait.parse(undefined)).toBe(true);
    expect(options["wait-timeout"].parse("30")).toBe(30);
  });
});

describe("waitTimeout", () => {
  it("builds a non-retryable failure that points at --wait-timeout", () => {
    expect(waitTimeout("Still processing.")).toEqual({
      code: "WAIT_TIMEOUT",
      message: "Still processing. Pass a larger --wait-timeout to wait longer.",
      exitCode: 1,
      retryable: false,
    });
  });
});

describe("resolveWaitOptions", () => {
  it("returns the timeout when waiting is enabled", () => {
    expect(resolveWaitOptions({ wait: true, "wait-timeout": 42 })).toEqual({ timeoutSeconds: 42 });
  });

  it("returns undefined when waiting is disabled", () => {
    expect(resolveWaitOptions({ wait: false, "wait-timeout": 42 })).toBeUndefined();
  });
});

describe("pollUntil", () => {
  it("resolves true once the check passes", async () => {
    const check = vi
      .fn<() => Promise<boolean>>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(pollUntil(check, fast)).resolves.toBe(true);
    expect(check).toHaveBeenCalledTimes(3);
  });

  it("resolves false when the deadline passes before the check succeeds", async () => {
    const check = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);

    await expect(pollUntil(check, { timeoutSeconds: 0.02, intervalMs: 5 })).resolves.toBe(false);
    expect(check.mock.calls.length).toBeGreaterThan(1);
  });

  it("propagates errors from the check", async () => {
    const check = vi.fn<() => Promise<boolean>>().mockRejectedValue(new Error("boom"));

    await expect(pollUntil(check, fast)).rejects.toThrow("boom");
  });
});

describe("component version availability", () => {
  afterEach(() => {
    mockGqlRequest.mockReset();
  });

  it("queries the component by id", async () => {
    mockGqlRequest.mockResolvedValue({ component: { id: "comp_1", versionIsAvailable: true } });

    await expect(isComponentVersionAvailable("comp_1")).resolves.toBe(true);
    expect(mockGqlRequest.mock.calls[0][0].variables).toEqual({ id: "comp_1" });
  });

  it("treats a missing component as not yet available", async () => {
    mockGqlRequest.mockResolvedValue({ component: null });

    await expect(isComponentVersionAvailable("comp_1")).resolves.toBe(false);
  });

  it("waits until the version becomes available", async () => {
    mockGqlRequest
      .mockResolvedValueOnce({ component: { id: "comp_1", versionIsAvailable: false } })
      .mockResolvedValueOnce({ component: { id: "comp_1", versionIsAvailable: true } });

    await expect(waitForComponentVersion("comp_1", fast)).resolves.toBe(true);
    expect(mockGqlRequest).toHaveBeenCalledTimes(2);
  });
});

describe("integration version availability", () => {
  afterEach(() => {
    mockGqlRequest.mockReset();
  });

  it("checks the version sequence for the published version", async () => {
    mockGqlRequest.mockResolvedValue({
      integration: { versionSequence: { nodes: [{ id: "ver_1" }] } },
    });

    await expect(isIntegrationVersionAvailable("int_1", 4)).resolves.toBe(true);
    expect(mockGqlRequest.mock.calls[0][0].variables).toEqual({
      integrationId: "int_1",
      versionNumber: 4,
    });
  });

  it("is not available while the version sequence has no matching available version", async () => {
    mockGqlRequest.mockResolvedValue({ integration: { versionSequence: { nodes: [] } } });

    await expect(isIntegrationVersionAvailable("int_1", 4)).resolves.toBe(false);
  });

  it("gives up after the timeout", async () => {
    mockGqlRequest.mockResolvedValue({ integration: null });

    await expect(
      waitForIntegrationVersion("int_1", 4, { timeoutSeconds: 0.02, intervalMs: 5 }),
    ).resolves.toBe(false);
  });
});

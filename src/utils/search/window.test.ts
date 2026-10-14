import { describe, expect, it } from "vitest";
import { DAY_MS, HOUR_MS, parseTime, resolveWindow } from "./window.js";

const now = new Date("2026-09-16T12:00:00Z");

describe("parseTime", () => {
  it("reads relative durations backwards from now", () => {
    expect(parseTime("15m", now).toISOString()).toBe("2026-09-16T11:45:00.000Z");
    expect(parseTime("2h", now).toISOString()).toBe("2026-09-16T10:00:00.000Z");
    expect(parseTime("7d", now).toISOString()).toBe("2026-09-09T12:00:00.000Z");
  });

  it("reads ISO timestamps and rejects anything else", () => {
    expect(parseTime("2026-09-01T00:00:00Z", now).toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(() => parseTime("yesterday", now)).toThrowError(
      expect.objectContaining({ code: "INVALID_TIME" }),
    );
  });
});

describe("resolveWindow", () => {
  it("defaults to a trailing span ending now", () => {
    const window = resolveWindow({}, DAY_MS, {}, now);
    expect(window.end).toEqual(now);
    expect(window.start.toISOString()).toBe("2026-09-15T12:00:00.000Z");
  });

  it("clamps a start at the retention edge inside the safety margin", () => {
    const window = resolveWindow({ since: "14d" }, DAY_MS, { maxAgeMs: 14 * DAY_MS }, now);
    expect(window.start.toISOString()).toBe("2026-09-02T12:05:00.000Z");
  });

  it("rejects windows older than retention or wider than the legacy span", () => {
    expect(() =>
      resolveWindow({ since: "30d" }, DAY_MS, { maxAgeMs: 14 * DAY_MS }, now),
    ).toThrowError(expect.objectContaining({ code: "TIME_WINDOW_TOO_OLD" }));
    expect(() =>
      resolveWindow({ since: "3d" }, HOUR_MS, { maxSpanMs: 48 * HOUR_MS }, now),
    ).toThrowError(expect.objectContaining({ code: "TIME_WINDOW_TOO_WIDE" }));
    expect(() => resolveWindow({ since: "1h", until: "2h" }, HOUR_MS, {}, now)).toThrowError(
      expect.objectContaining({ code: "INVALID_TIME_WINDOW" }),
    );
  });
});

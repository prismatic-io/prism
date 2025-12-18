import { describe, it, expect } from "vitest";
import { getAdaptivePollIntervalMs } from "./polling.js";

describe("getAdaptivePollIntervalMs", () => {
  it("should return proper poll intervals", () => {
    // Use a fixed timestamp to avoid timing issues
    const now = 1000000000;
    const realDateNow = Date.now;
    Date.now = () => now;

    try {
      expect(getAdaptivePollIntervalMs(now)).toBe(1000); // 0s elapsed => 1s delay
      expect(getAdaptivePollIntervalMs(now - 30000)).toBe(5000); // 30s elapsed => 5s delay
      expect(getAdaptivePollIntervalMs(now - 60000)).toBe(30000); // 1min elapsed => 30s delay
      expect(getAdaptivePollIntervalMs(now - 300000)).toBe(60000); // 5min elapsed => 1min delay
    } finally {
      Date.now = realDateNow;
    }
  });
});

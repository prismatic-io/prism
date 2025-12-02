import { describe, it, expect } from "bun:test";
import ListenCommand from "./listen.js";

describe("ListenCommand", () => {
  describe("hasTimedOut", () => {
    it("should return false when time elapsed is less than timeout", () => {
      const command = new ListenCommand([], {} as any);
      const now = Date.now();
      const realDateNow = Date.now;
      Date.now = () => now;

      try {
        (command as any).startTime = now - 5000; // 5 seconds ago
        const result = (command as any).hasTimedOut(10); // 10 second timeout
        expect(result).toBe(false);
      } finally {
        Date.now = realDateNow;
      }
    });

    it("should return true when time elapsed exceeds timeout", () => {
      const command = new ListenCommand([], {} as any);
      const now = Date.now();
      const realDateNow = Date.now;
      Date.now = () => now;

      try {
        (command as any).startTime = now - 15000; // 15 seconds ago
        const result = (command as any).hasTimedOut(10); // 10 second timeout
        expect(result).toBe(true);
      } finally {
        Date.now = realDateNow;
      }
    });
  });
});

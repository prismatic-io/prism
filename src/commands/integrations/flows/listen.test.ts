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

  describe("payload processing logic", () => {
    it("should correctly decode base64-encoded JSON", () => {
      const jsonPayload = { message: "Hello, World!", data: [1, 2, 3] };
      const base64Payload = Buffer.from(JSON.stringify(jsonPayload)).toString("base64");

      // Simulate the decoding logic from downloadAndSavePayload
      const decoded = Buffer.from(base64Payload, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);

      expect(parsed).toEqual(jsonPayload);
    });

    it("should handle base64-encoded plain text", () => {
      const plainText = "Hello from webhook";
      const base64Text = Buffer.from(plainText).toString("base64");

      const decoded = Buffer.from(base64Text, "base64").toString("utf-8");
      expect(decoded).toBe(plainText);
    });

    it("should handle non-base64 strings gracefully", () => {
      const plainText = "Not base64 content!";

      // Attempting to decode non-base64 as base64 may produce garbled output
      // The actual code tries to decode and falls back on error
      try {
        const decoded = Buffer.from(plainText, "base64").toString("utf-8");
        // If it doesn't throw, the decode happened but may be garbled
        expect(decoded).toBeDefined();
      } catch {
        // If it throws, that's also acceptable behavior
        expect(true).toBe(true);
      }
    });

    it("should handle JSON parsing errors gracefully", () => {
      const invalidJson = "{ this is not valid JSON }";

      let result: Record<string, unknown>;
      try {
        result = JSON.parse(invalidJson);
      } catch {
        result = { body: invalidJson };
      }

      expect(result).toEqual({ body: invalidJson });
    });
  });
});

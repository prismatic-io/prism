import { describe, it, expect } from "bun:test";
import ListenCommand, { getTriggerType } from "./listen.js";

describe("ListenCommand", () => {
  describe("getTriggerType", () => {
    it("should return POLLING when isPollingTrigger is true", () => {
      const trigger = {
        action: {
          isPollingTrigger: true,
          scheduleSupport: "NOT_REQUIRED",
          component: {
            key: "some-component",
          },
        },
      };

      const result = getTriggerType(trigger);
      expect(result).toBe("POLLING");
    });

    it("should return POLLING when scheduleSupport is REQUIRED and component key is not schedule-triggers", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: "REQUIRED",
          component: {
            key: "some-polling-component",
          },
        },
      };

      const result = getTriggerType(trigger);
      expect(result).toBe("POLLING");
    });

    it("should throw an error for scheduled flows (schedule-triggers component)", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: "REQUIRED",
          component: {
            key: "schedule-triggers",
          },
        },
      };

      expect(() => getTriggerType(trigger)).toThrow("Cannot listen to scheduled flows");
    });

    it("should return WEBHOOK when isPollingTrigger is false and scheduleSupport is NOT_REQUIRED", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: "NOT_REQUIRED",
          component: {
            key: "webhook-component",
          },
        },
      };

      const result = getTriggerType(trigger);
      expect(result).toBe("WEBHOOK");
    });

    it("should return WEBHOOK when isPollingTrigger is false and scheduleSupport is OPTIONAL", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: "OPTIONAL",
          component: {
            key: "some-component",
          },
        },
      };

      const result = getTriggerType(trigger);
      expect(result).toBe("WEBHOOK");
    });

    it("should throw an error even when isPollingTrigger is true but component is schedule-triggers", () => {
      const trigger = {
        action: {
          isPollingTrigger: true,
          scheduleSupport: "REQUIRED",
          component: {
            key: "schedule-triggers",
          },
        },
      };

      // Schedule-triggers should always be rejected, regardless of isPollingTrigger flag
      expect(() => getTriggerType(trigger)).toThrow("Cannot listen to scheduled flows");
    });
  });
});

import { describe, it, expect } from "vitest";
import { buildFlagString, testFlagsSchema } from "./test.js";
import { formatValidationError } from "../../../utils/validation.js";

describe("buildFlagString", () => {
  it("should return empty string when no options are provided", () => {
    expect(buildFlagString({})).toBe("");
  });

  it("should include payload and content-type flags when payloadFilePath is provided", () => {
    expect(
      buildFlagString({
        payloadFilePath: "payload.json",
        contentType: "application/json",
      }),
    ).toBe("-p=payload.json -c=application/json");
  });

  it("should include --tail-logs flag when tailLogs is true", () => {
    expect(buildFlagString({ tailLogs: true })).toBe("--tail-logs");
  });

  it("should include --tail-results flag when tailStepResults is true", () => {
    expect(buildFlagString({ tailStepResults: true })).toBe("--tail-results");
  });

  it("should include --sync flag when sync is true", () => {
    expect(buildFlagString({ sync: true })).toBe("--sync");
  });

  it("should include --cni-auto-end flag when autoEndPoll is true", () => {
    expect(buildFlagString({ autoEndPoll: true })).toBe("--cni-auto-end");
  });

  it("should include -r flag when resultFilePath is provided", () => {
    expect(buildFlagString({ resultFilePath: "results.jsonl" })).toBe("-r=results.jsonl");
  });

  it("should combine all flags correctly", () => {
    expect(
      buildFlagString({
        payloadFilePath: "payload.json",
        contentType: "application/json",
        tailLogs: true,
        tailStepResults: true,
        sync: true,
        autoEndPoll: true,
        resultFilePath: "results.jsonl",
      }),
    ).toBe(
      "-p=payload.json -c=application/json --tail-logs --tail-results --sync --cni-auto-end -r=results.jsonl",
    );
  });

  it("should combine a subset of flags correctly", () => {
    expect(
      buildFlagString({
        tailLogs: true,
        sync: true,
        resultFilePath: "out.jsonl",
      }),
    ).toBe("--tail-logs --sync -r=out.jsonl");
  });
});

describe("input flag validation", () => {
  describe("basic validation", () => {
    it("should validate minimal flags (all optional)", () => {
      const result = testFlagsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate with flow-id", () => {
      const result = testFlagsSchema.safeParse({
        "flow-id": "test-flow-123",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with flow-url", () => {
      const result = testFlagsSchema.safeParse({
        "flow-url": "https://example.com/test/flow",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with integration-id", () => {
      const result = testFlagsSchema.safeParse({
        "integration-id": "test-integration-123",
      });
      expect(result.success).toBe(true);
    });

    it("should apply default content-type", () => {
      const result = testFlagsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data["payload-content-type"]).toBe("application/json");
      }
    });
  });

  describe("tailing flags dependencies", () => {
    it("should allow cni-auto-end with tail-logs", () => {
      const result = testFlagsSchema.safeParse({
        "tail-logs": true,
        "cni-auto-end": true,
      });
      expect(result.success).toBe(true);
    });

    it("should allow cni-auto-end with tail-results", () => {
      const result = testFlagsSchema.safeParse({
        "tail-results": true,
        "cni-auto-end": true,
      });
      expect(result.success).toBe(true);
    });

    it("should fail when cni-auto-end is used without tailing", () => {
      const result = testFlagsSchema.safeParse({
        "cni-auto-end": true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationError(result.error);
        expect(formatted).toContain("--cni-auto-end requires --tail-logs or --tail-results");
      }
    });

    it("should allow result-file with tail-logs", () => {
      const result = testFlagsSchema.safeParse({
        "tail-logs": true,
        "result-file": "./results.jsonl",
      });
      expect(result.success).toBe(true);
    });

    it("should allow result-file with tail-results", () => {
      const result = testFlagsSchema.safeParse({
        "tail-results": true,
        "result-file": "./results.jsonl",
      });
      expect(result.success).toBe(true);
    });

    it("should fail when result-file is used without tailing", () => {
      const result = testFlagsSchema.safeParse({
        "result-file": "./results.jsonl",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationError(result.error);
        expect(formatted).toContain("--result-file requires --tail-logs or --tail-results");
      }
    });

    it("should allow jsonl with tail-logs", () => {
      const result = testFlagsSchema.safeParse({
        "tail-logs": true,
        jsonl: true,
      });
      expect(result.success).toBe(true);
    });

    it("should allow jsonl with tail-results", () => {
      const result = testFlagsSchema.safeParse({
        "tail-results": true,
        jsonl: true,
      });
      expect(result.success).toBe(true);
    });

    it("should fail when jsonl is used without tailing", () => {
      const result = testFlagsSchema.safeParse({
        jsonl: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationError(result.error);
        expect(formatted).toContain("--jsonl requires --tail-logs or --tail-results");
      }
    });

    it("should allow all tailing flags together", () => {
      const result = testFlagsSchema.safeParse({
        "tail-logs": true,
        "tail-results": true,
        "cni-auto-end": true,
        "result-file": "./results.jsonl",
        jsonl: true,
        timeout: 600,
      });
      expect(result.success).toBe(true);
    });

    it("should report multiple tailing dependency errors", () => {
      const result = testFlagsSchema.safeParse({
        "cni-auto-end": true,
        "result-file": "./results.jsonl",
        jsonl: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have 3 errors (one for each flag)
        expect(result.error.issues.length).toBe(3);
      }
    });
  });

  describe("complete workflow flags", () => {
    it("should validate a complete execution with all flags", () => {
      const result = testFlagsSchema.safeParse({
        "flow-id": "flow-123",
        "integration-id": "integration-456",
        payload: "./payload.json",
        "payload-content-type": "application/xml",
        sync: true,
        "tail-logs": true,
        "tail-results": true,
        "cni-auto-end": true,
        timeout: 300,
        "result-file": "./results.jsonl",
        jsonl: true,
        debug: true,
        apiKey: "my-api-key",
        quiet: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data["flow-id"]).toBe("flow-123");
        expect(result.data["payload-content-type"]).toBe("application/xml");
        expect(result.data.timeout).toBe(300);
      }
    });
  });
});

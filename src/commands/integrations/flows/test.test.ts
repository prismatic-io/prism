import { describe, it, expect } from "bun:test";
import { buildFlagString } from "./test.js";

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

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { buildFlagString } from "./test.js";
import TestFlowCommand from "./test.js";
import { ActionScheduleSupport, LogSeverityLevel } from "../../../graphql/schema.generated.js";

vi.mock("../../../utils/integration/query.js", () => ({
  getIntegrationSystemInstance: vi.fn(),
}));

vi.mock(import("../../../utils/integration/flows.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    resolveFlow: vi.fn(),
    getExecutionLogs: vi.fn(),
    isCniExecutionComplete: vi.fn(),
  };
});

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe("oclif defaults and Zod validation integration", () => {
  it("applies oclif default for payload-content-type when flag is omitted", async () => {
    const testFlowUrl = "https://hooks.example.com/trigger/test-flow";
    let requestReceived = false;

    server.use(
      http.post(testFlowUrl, () => {
        requestReceived = true;
        return HttpResponse.json(
          { executionId: "exec-123" },
          { headers: { "prismatic-executionid": "exec-123" } },
        );
      }),
    );

    // Run command WITHOUT --payload-content-type flag
    // If oclif defaults aren't applied before Zod validation, this would throw
    await TestFlowCommand.run(["--flow-url", testFlowUrl]);

    // Verify the command executed past Zod validation and made the HTTP request
    expect(requestReceived).toBe(true);
  });
});

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

describe("--cni-auto-end flag on non-code-native integrations", () => {
  const integrationId = "SW50ZWdyYXRpb246dGVzdC1pZA==";
  const flowId = "flow-123";
  const testFlowUrl = "https://hooks.example.com/trigger/test-flow";

  const setupMocks = async (isCodeNative: boolean) => {
    const { getIntegrationSystemInstance } = await import("../../../utils/integration/query.js");
    const { resolveFlow, getExecutionLogs, isCniExecutionComplete } = await import(
      "../../../utils/integration/flows.js"
    );

    vi.mocked(getIntegrationSystemInstance).mockResolvedValue({
      isCodeNative,
      isConfigured: true,
      systemInstanceId: "system-instance-123",
    });

    vi.mocked(resolveFlow).mockResolvedValue({
      id: flowId,
      name: "Test Flow",
      stableKey: "test-flow",
      description: "A test flow",
      testUrl: testFlowUrl,
      trigger: {
        action: {
          isPollingTrigger: false,
          scheduleSupport: ActionScheduleSupport.Valid,
          component: { key: "webhook-triggers" },
        },
      },
    });

    // Mock getExecutionLogs to return some logs, then signal completion
    vi.mocked(getExecutionLogs).mockResolvedValue({
      logs: {
        edges: [
          {
            node: {
              timestamp: new Date().toISOString(),
              severity: LogSeverityLevel.Info,
              message: "Test log message",
            },
            cursor: "cursor-1",
          },
        ],
      },
    });

    // Mock isCniExecutionComplete to return true so the tailing loop exits
    vi.mocked(isCniExecutionComplete).mockResolvedValue(true);

    server.use(
      http.post(testFlowUrl, () =>
        HttpResponse.json(
          { executionId: "exec-123" },
          { headers: { "prismatic-executionid": "exec-123" } },
        ),
      ),
    );
  };

  it("should warn when --cni-auto-end is used with a non-code-native integration", async () => {
    await setupMocks(false);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await TestFlowCommand.run([
      "--integration-id",
      integrationId,
      "--flow-id",
      flowId,
      "--tail-logs",
      "--cni-auto-end",
    ]);

    expect(warnSpy).toHaveBeenCalledWith(
      "The given integration is not code-native but the --cni-auto-end flag was configured.",
      "\nThis process will continue but ignore the --cni-auto-end flag.",
    );
  });

  it("should not warn when --cni-auto-end is used with a code-native integration", async () => {
    await setupMocks(true);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await TestFlowCommand.run([
      "--integration-id",
      integrationId,
      "--flow-id",
      flowId,
      "--tail-logs",
      "--cni-auto-end",
    ]);

    expect(warnSpy).not.toHaveBeenCalledWith(
      "The given integration is not code-native but the --cni-auto-end flag was configured.",
      "\nThis process will continue but ignore the --cni-auto-end flag.",
    );
  });
});

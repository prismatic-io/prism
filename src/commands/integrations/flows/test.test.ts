import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { graphql, http, HttpResponse } from "msw";
import { buildFlagString } from "./test.js";
import TestFlowCommand from "./test.js";
import {
  ActionScheduleSupport,
  InstanceConfigState,
  LogSeverityLevel,
} from "../../../graphql/schema.generated.js";
import type { GetIntegrationSystemInstanceQuery } from "../../../graphql/integrations/getIntegrationSystemInstance.generated.js";
import type { GetIntegrationFlowsQuery } from "../../../graphql/integrations/getIntegrationFlows.generated.js";
import type { GetExecutionLogsQuery } from "../../../graphql/executions/getExecutionLogs.generated.js";
import type { IsCniExecutionCompleteQuery } from "../../../graphql/executions/isCniExecutionComplete.generated.js";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);

type IntegrationFlowNode = NonNullable<
  NonNullable<GetIntegrationFlowsQuery["integration"]>["flows"]["nodes"][number]
>;

const buildGetIntegrationSystemInstanceResponse = (
  isCodeNative: boolean,
  configState?: InstanceConfigState,
): { data: GetIntegrationSystemInstanceQuery } => ({
  data: {
    integration: {
      isCodeNative,
      systemInstance: {
        id: "system-instance-123",
        configState: configState || InstanceConfigState.FullyConfigured,
      },
    },
  },
});

const buildGetIntegrationFlowsResponse = (
  flows: IntegrationFlowNode[],
): { data: GetIntegrationFlowsQuery } => ({
  data: {
    integration: {
      flows: {
        nodes: flows,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  },
});

const buildGetExecutionLogsResponse = (
  logs: Array<{ timestamp: string; severity: LogSeverityLevel; message: string }>,
  cursor?: string,
): { data: GetExecutionLogsQuery } => ({
  data: {
    logs: {
      edges: logs.map((log, index) => ({
        node: log,
        cursor: cursor ?? `cursor-${index}`,
      })),
    },
  },
});

const buildIsCniExecutionCompleteResponse = (
  totalCount: number,
): { data: IsCniExecutionCompleteQuery } => ({
  data: {
    executionResult: {
      stepResults: {
        totalCount,
      },
    },
  },
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

  const testFlow: IntegrationFlowNode = {
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
  };

  const setupMocks = (isCodeNative: boolean) => {
    server.use(
      api.query("GetIntegrationSystemInstance", () =>
        HttpResponse.json(buildGetIntegrationSystemInstanceResponse(isCodeNative)),
      ),
      api.query("GetIntegrationFlows", () =>
        HttpResponse.json(buildGetIntegrationFlowsResponse([testFlow])),
      ),
      api.query("GetExecutionLogs", () =>
        HttpResponse.json(
          buildGetExecutionLogsResponse([
            {
              timestamp: new Date().toISOString(),
              severity: LogSeverityLevel.Info,
              message: "Test log message",
            },
          ]),
        ),
      ),
      api.query("IsCniExecutionComplete", () =>
        HttpResponse.json(buildIsCniExecutionCompleteResponse(2)),
      ),
      http.post(testFlowUrl, () =>
        HttpResponse.json(
          { executionId: "exec-123" },
          { headers: { "prismatic-executionid": "exec-123" } },
        ),
      ),
    );
  };

  it("should warn when --cni-auto-end is used with a non-code-native integration", async () => {
    setupMocks(false);
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
    setupMocks(true);
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

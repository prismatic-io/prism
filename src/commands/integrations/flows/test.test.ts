import { graphql, HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import type { GetExecutionLogsQuery } from "../../../graphql/executions/getExecutionLogs.generated.js";
import type { IsCniExecutionCompleteQuery } from "../../../graphql/executions/isCniExecutionComplete.generated.js";
import type { GetIntegrationFlowsQuery } from "../../../graphql/integrations/getIntegrationFlows.generated.js";
import type { GetIntegrationSystemInstanceQuery } from "../../../graphql/integrations/getIntegrationSystemInstance.generated.js";
import {
  ActionScheduleSupport,
  InstanceConfigState,
  LogSeverityLevel,
} from "../../../graphql/schema.generated.js";
import { runCommand } from "../../../test-command.js";
import TestFlowCommand, { buildFlagString, fetchStepResultBatch } from "./test.js";

vi.mock("../../../utils/polling.js", () => ({ getAdaptivePollIntervalMs: () => 1 }));

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

describe("command defaults and Zod validation integration", () => {
  it("applies the default payload-content-type when the flag is omitted", async () => {
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
    // The handler applies the default after validation so explicit values remain distinguishable.
    await runCommand(TestFlowCommand, ["--flow-url", testFlowUrl]);

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
    const result = await runCommand(TestFlowCommand, [
      "--integration-id",
      integrationId,
      "--flow-id",
      flowId,
      "--tail-logs",
      "--cni-auto-end",
      "--timeout",
      "1",
    ]);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: "warning",
          message: "The integration is not code-native; --cni-auto-end is ignored.",
        },
        expect.objectContaining({ type: "completed", status: "timed-out" }),
      ]),
    );
  });

  it("should not warn when --cni-auto-end is used with a code-native integration", async () => {
    setupMocks(true);
    const result = await runCommand(TestFlowCommand, [
      "--integration-id",
      integrationId,
      "--flow-id",
      flowId,
      "--tail-logs",
      "--cni-auto-end",
      "--timeout",
      "1",
    ]);

    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "The integration is not code-native; --cni-auto-end is ignored.",
        }),
      ]),
    );
  });
});

describe("native agent tail output", () => {
  it.each([false, true])("retains typed log records with legacy jsonl=%s", async (jsonl) => {
    const log = {
      timestamp: "2026-09-08T00:00:00Z",
      severity: LogSeverityLevel.Info,
      message: "hello",
    };
    const url = "https://hooks.example.com/native-tail";
    server.use(
      http.post(url, () => HttpResponse.json({ executionId: "execution-id" })),
      api.query("GetExecutionLogs", () => HttpResponse.json(buildGetExecutionLogsResponse([log]))),
      api.query("IsCniExecutionComplete", () =>
        HttpResponse.json(buildIsCniExecutionCompleteResponse(2)),
      ),
    );
    const result = await runCommand(TestFlowCommand, [
      "--agent",
      "--yes",
      "--flow-url",
      url,
      "--tail-logs",
      "--cni-auto-end",
      ...(jsonl ? ["--jsonl"] : []),
    ]);
    expect(result).toEqual(
      expect.arrayContaining([{ type: "log", executionId: "execution-id", data: log }]),
    );
    for (const event of result as unknown[])
      expect(TestFlowCommand.output.safeParse(event).success).toBe(true);
  });
});

it("retains nested typed step results when reading a native poll batch", async () => {
  const payload = { count: 2, ok: true, values: [1, 2] };
  const { encode } = await import("@msgpack/msgpack");
  server.use(
    api.query("GetExecutionStepResults", () =>
      HttpResponse.json({
        data: {
          executionResult: {
            stepResults: {
              edges: [
                {
                  cursor: "next",
                  node: {
                    stepName: "Step",
                    endedAt: "2026-09-08T00:00:00Z",
                    resultsUrl: "https://storage.example.com/step",
                  },
                },
              ],
            },
          },
        },
      }),
    ),
    http.get("https://storage.example.com/step", () => new HttpResponse(encode(payload))),
  );
  const result = await fetchStepResultBatch("execution-id");
  expect(result).toEqual({
    cursor: "next",
    warnings: [],
    stepResults: [{ stepName: "Step", endedAt: "2026-09-08T00:00:00Z", result: payload }],
  });
});

it("returns the named execution ID and typed trigger response in agent mode", async () => {
  const testFlowUrl = "https://hooks.example.com/trigger/agent-flow";
  server.use(
    http.post(testFlowUrl, () =>
      HttpResponse.json(
        { count: 2, ok: true },
        { headers: { "prismatic-executionid": "execution-id" } },
      ),
    ),
  );
  const result = await runCommand(TestFlowCommand, ["--agent", "--yes", "--flow-url", testFlowUrl]);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "execution",
        executionId: "execution-id",
        response: { count: 2, ok: true },
      }),
      { type: "completed", executionId: "execution-id", status: "submitted" },
    ]),
  );
  for (const event of result as unknown[])
    expect(TestFlowCommand.output.safeParse(event).success).toBe(true);
});

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { encode } from "@msgpack/msgpack";
import { setupServer } from "msw/node";
import { graphql, HttpResponse, http } from "msw";
import { ActionScheduleSupport } from "../../../graphql/schema.generated.js";
import type { GetIntegrationFlowsQuery } from "../../../graphql/integrations/getIntegrationFlows.generated.js";
import type { GetExecutionsQuery } from "../../../graphql/executions/getExecutions.generated.js";
import type { GetPolledExecutionQuery } from "../../../graphql/executions/getPolledExecution.generated.js";
import type { TestIntegrationFlowMutation } from "../../../graphql/integrations/testIntegrationFlow.generated.js";
import type { UpdateIntegrationFlowListeningModeMutation } from "../../../graphql/integrations/updateIntegrationFlowListeningMode.generated.js";
import { fs } from "../../../fs.js";
import inquirer from "inquirer";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import ListenCommand, { getTriggerType } from "./listen.js";

vi.mock("../../../fs.js", () => ({
  exists: vi.fn(() => Promise.resolve(true)),
  fs: {
    mkdir: vi.fn(() => Promise.resolve()),
    writeFile: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(() => Promise.resolve({ confirm: true, selectedFlow: null })),
  },
}));

vi.mock(import("@oclif/core"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ux: {
      ...actual.ux,
      wait: vi.fn(() => Promise.resolve()),
    },
  };
});

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);

type IntegrationFlowNode = NonNullable<
  NonNullable<GetIntegrationFlowsQuery["integration"]>["flows"]["nodes"][number]
>;

const createWebhookFlow = (id: string, name: string): IntegrationFlowNode => ({
  id,
  name,
  stableKey: `${name.toLowerCase().replace(/\s/g, "-")}-key`,
  description: `${name} description`,
  testUrl: `${TEST_PRISMATIC_URL}/test/${id}`,
  trigger: {
    action: {
      isPollingTrigger: false,
      scheduleSupport: ActionScheduleSupport.Valid,
      component: { key: "webhook-triggers" },
    },
  },
});

const createPollingFlow = (id: string, name: string): IntegrationFlowNode => ({
  id,
  name,
  stableKey: `${name.toLowerCase().replace(/\s/g, "-")}-key`,
  description: `${name} description`,
  testUrl: `${TEST_PRISMATIC_URL}/test/${id}`,
  trigger: {
    action: {
      isPollingTrigger: true,
      scheduleSupport: ActionScheduleSupport.Valid,
      component: { key: "salesforce" },
    },
  },
});

// Response builders for GraphQL operations
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

const buildGetExecutionsResponse = (
  executions: Array<{
    id: string;
    endedAt?: string | null;
    requestPayloadUrl?: string;
    responsePayloadUrl?: string;
  }>,
): { data: GetExecutionsQuery } => ({
  data: {
    executionResults: {
      nodes: executions.map((e) => ({
        id: e.id,
        endedAt: e.endedAt ?? null,
        requestPayloadUrl: e.requestPayloadUrl ?? "",
        responsePayloadUrl: e.responsePayloadUrl ?? "",
      })),
    },
  },
});

const buildGetPolledExecutionResponse = (
  execution: {
    id: string;
    endedAt?: string | null;
    stepResults?: Array<{ id: string; stepName: string; resultsUrl: string }>;
  } | null,
): { data: GetPolledExecutionQuery } => ({
  data: {
    executionResult: execution
      ? {
          id: execution.id,
          endedAt: execution.endedAt ?? null,
          stepResults: { nodes: execution.stepResults ?? [] },
        }
      : null,
  },
});

const buildTestIntegrationFlowResponse = (
  executionId: string,
): { data: TestIntegrationFlowMutation } => ({
  data: {
    testIntegrationFlow: {
      testIntegrationFlowResult: {
        execution: { id: executionId },
      },
      errors: [],
    },
  },
});

const buildUpdateListeningModeResponse = (
  errors: Array<{ field: string; messages: string[] }> = [],
): { data: UpdateIntegrationFlowListeningModeMutation } => ({
  data: {
    updateWorkflowTestConfiguration: { errors },
  },
});

const server = setupServer(
  api.mutation("UpdateIntegrationFlowListeningMode", () =>
    HttpResponse.json(buildUpdateListeningModeResponse()),
  ),
);

describe("oclif defaults and Zod validation integration", () => {
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

  it("applies oclif defaults for output and timeout when flags are omitted", async () => {
    const webhookFlow = createWebhookFlow("flow-defaults-test", "Defaults Test Flow");

    server.use(
      api.query("GetIntegrationFlows", () =>
        HttpResponse.json(buildGetIntegrationFlowsResponse([webhookFlow])),
      ),
      api.query("GetExecutions", () =>
        HttpResponse.json(
          buildGetExecutionsResponse([
            {
              id: "exec-defaults-test",
              endedAt: new Date().toISOString(),
              requestPayloadUrl: "https://storage.example.com/payload.json",
            },
          ]),
        ),
      ),
      http.get("https://storage.example.com/payload.json", () =>
        HttpResponse.json({
          body: Buffer.from(JSON.stringify({ test: "data" })).toString("base64"),
          contentType: "application/json",
          headers: "{}",
        }),
      ),
    );

    // Run command WITHOUT --output or --timeout flags
    // If oclif defaults aren't applied before Zod validation, this would throw
    await ListenCommand.run([
      "--integration-id",
      "test-integration",
      "--flow-id",
      "flow-defaults-test",
    ]);

    // Verify the default output directory was used
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("./payloads/"),
      expect.any(String),
    );
  });
});

describe("ListenCommand", () => {
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

  describe("getTriggerType", () => {
    it("should return POLLING when isPollingTrigger is true", () => {
      const trigger = {
        action: {
          isPollingTrigger: true,
          scheduleSupport: ActionScheduleSupport.Required,
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
          scheduleSupport: ActionScheduleSupport.Required,
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
          scheduleSupport: ActionScheduleSupport.Required,
          component: {
            key: "schedule-triggers",
          },
        },
      };

      expect(() => getTriggerType(trigger)).toThrow("Cannot listen to scheduled flows");
    });

    it("should return WEBHOOK when isPollingTrigger is false and scheduleSupport is valid", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: ActionScheduleSupport.Valid,
          component: {
            key: "webhook-component",
          },
        },
      };

      const result = getTriggerType(trigger);
      expect(result).toBe("WEBHOOK");
    });

    it("should return WEBHOOK when isPollingTrigger is false and scheduleSupport is valid", () => {
      const trigger = {
        action: {
          isPollingTrigger: false,
          scheduleSupport: ActionScheduleSupport.Valid,
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
          scheduleSupport: ActionScheduleSupport.Required,
          component: {
            key: "schedule-triggers",
          },
        },
      };

      // Schedule-triggers should always be rejected, regardless of isPollingTrigger flag
      expect(() => getTriggerType(trigger)).toThrow("Cannot listen to scheduled flows");
    });
  });

  describe("webhook flow listening", () => {
    it("waits for a completed execution before saving a payload", async () => {
      const webhookFlow = createWebhookFlow("flow-456", "Webhook Flow");
      let getExecutionsCallCount = 0;

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([webhookFlow])),
        ),
        api.query("GetExecutions", function* () {
          getExecutionsCallCount++;
          yield HttpResponse.json(buildGetExecutionsResponse([{ id: "exec-456" }]));
          getExecutionsCallCount++;
          return HttpResponse.json(
            buildGetExecutionsResponse([
              {
                id: "exec-456",
                endedAt: new Date().toISOString(),
                requestPayloadUrl: "https://storage.example.com/payload.json",
                responsePayloadUrl: "https://storage.example.com/response.json",
              },
            ]),
          );
        }),
        http.get("https://storage.example.com/payload.json", () =>
          HttpResponse.json({
            body: Buffer.from(JSON.stringify({ test: "data" })).toString("base64"),
            contentType: "application/json",
            headers: "{}",
          }),
        ),
      );

      await ListenCommand.run([
        "--integration-id",
        "test-integration-123",
        "--flow-id",
        "flow-456",
        "--timeout",
        "5",
      ]);

      // Verify we polled at least twice (once for incomplete, once for complete)
      expect(getExecutionsCallCount).toBeGreaterThanOrEqual(2);
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("polling flow listening", () => {
    it("should initiate poll and save payload when execution completes", async () => {
      const pollingFlow = createPollingFlow("flow-poll-123", "Polling Flow");
      const msgpackData = encode({ data: { body: { data: { test: "poll-data" } } } });

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([pollingFlow])),
        ),
        api.mutation("TestIntegrationFlow", () =>
          HttpResponse.json(buildTestIntegrationFlowResponse("exec-poll-123")),
        ),
        api.query("GetPolledExecution", function* () {
          yield HttpResponse.json(buildGetPolledExecutionResponse({ id: "exec-poll-123" }));
          return HttpResponse.json(
            buildGetPolledExecutionResponse({
              id: "exec-poll-123",
              endedAt: new Date().toISOString(),
              stepResults: [
                {
                  id: "step-123",
                  stepName: "Trigger Step",
                  resultsUrl: "https://storage.example.com/poll-results.msgpack",
                },
              ],
            }),
          );
        }),
        http.get("https://storage.example.com/poll-results.msgpack", () =>
          HttpResponse.arrayBuffer(
            msgpackData.buffer.slice(
              msgpackData.byteOffset,
              msgpackData.byteOffset + msgpackData.byteLength,
            ),
          ),
        ),
      );

      await ListenCommand.run([
        "--integration-id",
        "test-integration-123",
        "--flow-id",
        "flow-poll-123",
        "--timeout",
        "5",
        "--no-prompt",
      ]);

      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("flow selection", () => {
    it("should prompt for flow selection when flow-id is not provided", async () => {
      const webhookFlow = createWebhookFlow("flow-select-123", "My Webhook Flow");
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFlow: webhookFlow });

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([webhookFlow])),
        ),
        api.query("GetExecutions", () =>
          HttpResponse.json(
            buildGetExecutionsResponse([
              {
                id: "exec-select-123",
                endedAt: new Date().toISOString(),
                requestPayloadUrl: "https://storage.example.com/payload.json",
                responsePayloadUrl: "https://storage.example.com/response.json",
              },
            ]),
          ),
        ),
        http.get("https://storage.example.com/payload.json", () =>
          HttpResponse.json({
            body: Buffer.from(JSON.stringify({ test: "data" })).toString("base64"),
            contentType: "application/json",
            headers: "{}",
          }),
        ),
      );

      await ListenCommand.run(["--integration-id", "test-integration-123", "--timeout", "5"]);

      expect(inquirer.prompt).toHaveBeenCalled();
    });

    it("should throw error when flow-id is provided but not found", async () => {
      const webhookFlow = createWebhookFlow("flow-other-123", "Other Flow");

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([webhookFlow])),
        ),
      );

      await expect(
        ListenCommand.run([
          "--integration-id",
          "test-integration-123",
          "--flow-id",
          "non-existent-flow",
          "--timeout",
          "5",
        ]),
      ).rejects.toThrow(/Could not find flow/i);
    });
  });

  describe("timeout handling", () => {
    it("should warn and exit when timeout is reached for webhook flow", async () => {
      const webhookFlow = createWebhookFlow("flow-timeout-123", "Timeout Flow");

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([webhookFlow])),
        ),
        api.query("GetExecutions", () =>
          // Always return no executions to trigger timeout
          HttpResponse.json(buildGetExecutionsResponse([])),
        ),
      );

      // Mock Date.now to simulate timeout
      const originalDateNow = Date.now;
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() => {
        callCount++;
        // After first call (startTime), return a time past the timeout
        if (callCount > 2) {
          return originalDateNow() + 10000; // 10 seconds later
        }
        return originalDateNow();
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        await ListenCommand.run([
          "--integration-id",
          "test-integration-123",
          "--flow-id",
          "flow-timeout-123",
          "--timeout",
          "1", // 1 second timeout
        ]);
      } catch (error) {
        expect((error as Error).message).toBe("process.exit called");
      }

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Timeout"));
      vi.spyOn(Date, "now").mockRestore();
    });
  });

  describe("scheduled flow rejection", () => {
    it("should throw error when trying to listen to a scheduled flow", async () => {
      const scheduledFlow: IntegrationFlowNode = {
        id: "flow-scheduled-123",
        name: "Scheduled Flow",
        stableKey: "scheduled-flow-key",
        description: "A scheduled flow",
        testUrl: `${TEST_PRISMATIC_URL}/test/flow-scheduled-123`,
        trigger: {
          action: {
            isPollingTrigger: false,
            scheduleSupport: ActionScheduleSupport.Required,
            component: { key: "schedule-triggers" },
          },
        },
      };

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([scheduledFlow])),
        ),
      );

      await expect(
        ListenCommand.run([
          "--integration-id",
          "test-integration-123",
          "--flow-id",
          "flow-scheduled-123",
          "--timeout",
          "5",
        ]),
      ).rejects.toThrow("Cannot listen to scheduled flows");
    });
  });
});

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { graphql, HttpResponse } from "msw";
import { getIntegrationFlows, isCniExecutionComplete, selectFlowPrompt } from "./flows.js";
import { ActionScheduleSupport } from "../../graphql/schema.generated.js";
import type { GetIntegrationFlowsQuery } from "../../graphql/integrations/getIntegrationFlows.generated.js";
import type { IsCniExecutionCompleteQuery } from "../../graphql/executions/isCniExecutionComplete.generated.js";
import inquirer from "inquirer";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";

vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(() => Promise.resolve({ selectedFlow: null })),
  },
}));

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);

type IntegrationFlowNode = NonNullable<
  NonNullable<GetIntegrationFlowsQuery["integration"]>["flows"]["nodes"][number]
>;

const createFlowNode = (
  id: string,
  name: string,
  options: { stableKey?: string; isPolling?: boolean } = {},
): IntegrationFlowNode => ({
  id,
  name,
  stableKey: options.stableKey ?? `${name.toLowerCase().replace(/\s/g, "-")}-key`,
  description: `${name} description`,
  testUrl: `https://test.prismatic.io/test/${id}`,
  trigger: {
    action: {
      isPollingTrigger: options.isPolling ?? false,
      scheduleSupport: ActionScheduleSupport.Valid,
      component: { key: options.isPolling ? "salesforce" : "webhook-triggers" },
    },
  },
});

// Response builders
const buildGetIntegrationFlowsResponse = (
  flows: IntegrationFlowNode[],
  pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
    hasNextPage: false,
    endCursor: null,
  },
): { data: GetIntegrationFlowsQuery } => ({
  data: {
    integration: {
      flows: {
        nodes: flows,
        pageInfo,
      },
    },
  },
});

const buildIsCniExecutionCompleteResponse = (
  totalCount: number,
): { data: IsCniExecutionCompleteQuery } => ({
  data: {
    executionResult: {
      stepResults: { totalCount },
    },
  },
});

const server = setupServer();

describe("flows utils", () => {
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

  describe("getIntegrationFlows", () => {
    it("should fetch flows for an integration", async () => {
      const flow1 = createFlowNode("flow-1", "Flow One");
      const flow2 = createFlowNode("flow-2", "Flow Two");

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([flow1, flow2])),
        ),
      );

      const result = await getIntegrationFlows("integration-123");

      expect(result).toHaveLength(2);
    });

    it("should handle pagination and fetch all flows", async () => {
      const flow1 = createFlowNode("flow-1", "Flow One");
      const flow2 = createFlowNode("flow-2", "Flow Two");
      const flow3 = createFlowNode("flow-3", "Flow Three");

      server.use(
        api.query("GetIntegrationFlows", function* () {
          yield HttpResponse.json(
            buildGetIntegrationFlowsResponse([flow1, flow2], {
              hasNextPage: true,
              endCursor: "cursor-1",
            }),
          );
          return HttpResponse.json(buildGetIntegrationFlowsResponse([flow3]));
        }),
      );

      const result = await getIntegrationFlows("integration-123");

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("flow-1");
      expect(result[1].id).toBe("flow-2");
      expect(result[2].id).toBe("flow-3");
    });

    it("should return empty array when integration not found", async () => {
      server.use(
        api.query("GetIntegrationFlows", () => HttpResponse.json({ data: { integration: null } })),
      );

      const result = await getIntegrationFlows("non-existent-integration");

      expect(result).toEqual([]);
    });

    it("should filter out null nodes", async () => {
      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json({
            data: {
              integration: {
                flows: {
                  nodes: [createFlowNode("flow-1", "Flow One"), null],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
            },
          }),
        ),
      );

      const result = await getIntegrationFlows("integration-123");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("flow-1");
    });
  });

  describe("isCniExecutionComplete", () => {
    it("should return true when stepResults totalCount is 2", async () => {
      server.use(
        api.query("IsCniExecutionComplete", () =>
          HttpResponse.json(buildIsCniExecutionCompleteResponse(2)),
        ),
      );

      const result = await isCniExecutionComplete("execution-123");

      expect(result).toBe(true);
    });

    it("should return false when stepResults totalCount is less than 2", async () => {
      server.use(
        api.query("IsCniExecutionComplete", () =>
          HttpResponse.json(buildIsCniExecutionCompleteResponse(1)),
        ),
      );

      const result = await isCniExecutionComplete("execution-123");

      expect(result).toBe(false);
    });
  });

  describe("selectFlowPrompt", () => {
    it("should fetch flows and prompt user for selection", async () => {
      const flow1 = createFlowNode("flow-1", "Flow One");
      const flow2 = createFlowNode("flow-2", "Flow Two");

      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFlow: flow1 });

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([flow1, flow2])),
        ),
      );

      const result = await selectFlowPrompt("integration-123");

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "list",
          name: "selectedFlow",
          message: "Select a flow:",
        }),
      );
      expect(result).toBe(flow1);
    });

    it("should throw error when no flows are found", async () => {
      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([])),
        ),
      );

      await expect(selectFlowPrompt("integration-123")).rejects.toThrow(
        "No flows were found for the given integration.",
      );
    });

    it("should format flow choices with name and stableKey", async () => {
      const flow1 = createFlowNode("flow-1", "Flow One", { stableKey: "flow-one" });
      const flow2 = createFlowNode("flow-2", "Flow Two", { stableKey: "flow-two" });

      let capturedChoices: Array<{ name: string; value: unknown }> = [];
      vi.mocked(inquirer.prompt).mockImplementationOnce(async (options) => {
        capturedChoices = (options as { choices: typeof capturedChoices }).choices;
        return { selectedFlow: flow1 };
      });

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([flow1, flow2])),
        ),
      );

      await selectFlowPrompt("integration-123");

      expect(capturedChoices).toHaveLength(2);
      expect(capturedChoices[0].name).toBe("Flow One (flow-one)");
      expect(capturedChoices[1].name).toBe("Flow Two (flow-two)");
    });

    it("should handle flows without stableKey", async () => {
      const flowWithoutKey: IntegrationFlowNode = {
        id: "flow-1",
        name: "Flow One",
        stableKey: null,
        description: "Test flow",
        testUrl: "https://test.prismatic.io/test/flow-1",
        trigger: {
          action: {
            isPollingTrigger: false,
            scheduleSupport: ActionScheduleSupport.Valid,
            component: { key: "webhook-triggers" },
          },
        },
      };

      let capturedChoices: Array<{ name: string; value: unknown }> = [];
      vi.mocked(inquirer.prompt).mockImplementationOnce(async (options) => {
        capturedChoices = (options as { choices: typeof capturedChoices }).choices;
        return { selectedFlow: flowWithoutKey };
      });

      server.use(
        api.query("GetIntegrationFlows", () =>
          HttpResponse.json(buildGetIntegrationFlowsResponse([flowWithoutKey])),
        ),
      );

      await selectFlowPrompt("integration-123");

      expect(capturedChoices[0].name).toBe("Flow One ");
    });

    it("should throw custom lookupError when getIntegrationFlows fails", async () => {
      server.use(api.query("GetIntegrationFlows", () => HttpResponse.error()));

      await expect(
        selectFlowPrompt("integration-123", { lookupError: "Custom lookup error" }),
      ).rejects.toThrow("Custom lookup error");
    });
  });
});

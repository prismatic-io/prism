import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getStdout, TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import TestCommand from "./test.js";

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);

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

describe("instances:flow-configs:test --tail section tagging", () => {
  const executionId = "exec-123";
  const sectionId = "section-abc-123";

  const setupMocks = (sections: Array<{ sectionId: string; label: string }>) => {
    server.use(
      api.mutation("testInstanceFlowConfig", () =>
        HttpResponse.json({
          data: {
            testInstanceFlowConfig: {
              testInstanceFlowConfigResult: {
                flowConfig: { id: "flow-config-123" },
                execution: { id: executionId },
              },
              errors: [],
            },
          },
        }),
      ),
      api.query("listInstanceTestLogs", () =>
        HttpResponse.json({
          data: {
            logs: {
              edges: [
                {
                  node: {
                    timestamp: new Date().toISOString(),
                    severity: "INFO",
                    message: "Log inside a section",
                    sectionId,
                  },
                  cursor: "cursor-0",
                },
                {
                  node: {
                    timestamp: new Date().toISOString(),
                    severity: "INFO",
                    message: "Ending Instance Execution",
                    sectionId: null,
                  },
                  cursor: "cursor-1",
                },
              ],
            },
          },
        }),
      ),
      api.query("GetExecutionSections", () =>
        HttpResponse.json({
          data: {
            executionSections: {
              nodes: sections,
            },
          },
        }),
      ),
    );
  };

  it("tags a log line with its resolved section label", async () => {
    setupMocks([{ sectionId, label: "My Section" }]);

    await TestCommand.run(["flow-config-123", "--tail"]);

    expect(getStdout()).toContain("[My Section] Log inside a section");
  });

  it("falls back to the raw section id when the label hasn't mirrored to Postgres yet", async () => {
    setupMocks([]);

    await TestCommand.run(["flow-config-123", "--tail"]);

    expect(getStdout()).toContain(`[${sectionId}] Log inside a section`);
  });
});

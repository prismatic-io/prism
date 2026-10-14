import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";
import { runCommand } from "../../test-command.js";
import { forgetStackCapabilities } from "../../utils/search/engine.js";
import LogsListCommand from "../logs/list.js";
import ListCommand from "./list.js";

let supportsAoss = true;
const operations: string[] = [];
const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const run = {
  id: "execution-1",
  status: "ERROR",
  resultType: "ERROR",
  invokeType: "WEBHOOK",
  startedAt: "2026-09-16T10:00:00.000Z",
  endedAt: "2026-09-16T10:00:01.000Z",
  queuedAt: null,
  resumedAt: null,
  durationMs: 1000,
  stepCount: 2,
  error: "boom",
  errorStepName: "fetch",
  instanceId: "instance-1",
  instanceName: "Acme",
  customerId: "customer-1",
  customerName: "Acme Co",
  customerExternalId: null,
  integrationId: "integration-1",
  integrationName: "Sync",
  flowId: "flow-1",
  flowName: "Flow 1",
  isTestExecution: false,
  isReplay: false,
  retryAttemptNumber: null,
  retryForExecutionId: null,
  allowUpdate: true,
};
const server = setupServer(
  api.query("stackCapabilities", () => {
    operations.push("stackCapabilities");
    return HttpResponse.json({
      data: { authenticatedUser: { org: { stackCapabilities: { supportsAoss } } } },
    });
  }),
  api.query("searchExecutionRuns", () => {
    operations.push("searchExecutionRuns");
    return HttpResponse.json({
      data: {
        executionRuns: {
          edges: [{ cursor: "cursor-1", node: run }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  }),
  api.query("legacyExecutionResults", () => {
    operations.push("legacyExecutionResults");
    return HttpResponse.json({
      data: {
        executionResults: {
          totalCount: 0,
          nodes: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  forgetStackCapabilities();
  supportsAoss = true;
});
afterEach(() => {
  operations.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe("executions:list", () => {
  it("uses the search API when the stack supports it and reports the engine", async () => {
    const result = await runCommand(ListCommand, ["--agent", "--status", "error"]);
    expect(result).toMatchObject({
      engine: "search",
      items: [{ id: "execution-1", status: "ERROR", durationMs: 1000, errorStepName: "fetch" }],
      pageInfo: { hasNextPage: false, endCursor: null },
    });
    expect(operations).toEqual(["stackCapabilities", "searchExecutionRuns"]);
  });

  it("falls back to the legacy API on stacks without the search API", async () => {
    supportsAoss = false;
    const result = await runCommand(ListCommand, ["--agent", "--instance", "instance-1"]);
    expect(result).toMatchObject({ engine: "legacy", items: [] });
    expect(operations).toEqual(["stackCapabilities", "legacyExecutionResults"]);
  });

  it("fails loudly instead of degrading a filter the legacy API cannot express", async () => {
    supportsAoss = false;
    await expect(
      runCommand(ListCommand, ["--agent", "--payload", "order.id=1"]),
    ).rejects.toMatchObject({
      code: "SEARCH_CAPABILITY_UNAVAILABLE",
    });
    expect(operations).toEqual(["stackCapabilities"]);
  });
});

describe("logs:list", () => {
  it("enforces the legacy 48 hour window before calling the API", async () => {
    supportsAoss = false;
    await expect(runCommand(LogsListCommand, ["--agent", "--since", "3d"])).rejects.toMatchObject({
      code: "TIME_WINDOW_TOO_WIDE",
    });
    expect(operations).toEqual(["stackCapabilities"]);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { gqlRequest } from "../../graphql.js";
import { forgetStackCapabilities, resolveEngine } from "./engine.js";
import { countExecutions, searchExecutions } from "./executions.js";
import { condition } from "./filters.js";

vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

const request = vi.mocked(gqlRequest);
const variablesOf = (call: number) =>
  (request.mock.calls[call]?.[0] as { variables: Record<string, unknown> }).variables;
const window = { start: new Date("2026-09-15T12:00:00Z"), end: new Date("2026-09-16T12:00:00Z") };
const emptyRuns = {
  executionRuns: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
};

beforeEach(() => forgetStackCapabilities());

describe("resolveEngine", () => {
  it("prefers the search API when the stack has it and remembers the answer", async () => {
    request.mockResolvedValue({
      authenticatedUser: { org: { stackCapabilities: { supportsAoss: true } } },
    } as never);
    expect(await resolveEngine()).toBe("search");
    expect(await resolveEngine()).toBe("search");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("falls back to legacy without the search API", async () => {
    request.mockResolvedValue({
      authenticatedUser: { org: { stackCapabilities: { supportsAoss: false } } },
    } as never);
    expect(await resolveEngine()).toBe("legacy");
  });
});

describe("searchExecutions on the search API", () => {
  it("hides test executions, uppercases enum values, and sends one AND group", async () => {
    request.mockResolvedValueOnce(emptyRuns as never);
    await searchExecutions("search", {
      window,
      includeTests: false,
      conditions: [condition("status", FilterOperator.Eq, "error")],
      sort: { field: "durationMs", direction: "desc" },
      first: 10,
    });
    expect(variablesOf(0)).toEqual({
      first: 10,
      after: null,
      startedAtGte: "2026-09-15T12:00:00.000Z",
      startedAtLte: "2026-09-16T12:00:00.000Z",
      filterGroups: [
        {
          operator: "AND",
          filters: [
            { keyPath: "isTestExecution", operator: "NOT_EQ", value: true },
            { keyPath: "status", operator: "EQ", value: "ERROR" },
          ],
        },
      ],
      orderBy: { field: "DURATION_MS", direction: "DESC" },
    });
  });

  it("sends no filter groups when nothing narrows the search", async () => {
    request.mockResolvedValueOnce(emptyRuns as never);
    await searchExecutions("search", { window, includeTests: true, conditions: [] });
    expect(variablesOf(0)).toMatchObject({ filterGroups: null, orderBy: null });
  });
});

describe("searchExecutions on legacy", () => {
  const legacyPage = (nodes: unknown[]) => ({
    executionResults: {
      totalCount: nodes.length,
      nodes,
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  });

  it("translates supported conditions into legacy arguments and normalizes rows", async () => {
    request.mockResolvedValueOnce(
      legacyPage([
        {
          id: "execution-1",
          status: "SUCCESS",
          resultType: "COMPLETED",
          invokeType: "WEBHOOK",
          startedAt: "2026-09-16T10:00:00.000Z",
          endedAt: "2026-09-16T10:00:02.500Z",
          stepCount: 3,
          error: null,
          isTestExecution: false,
          retryCount: 0,
          allowUpdate: true,
          retryForExecution: null,
          replayForExecution: null,
          instance: {
            id: "instance-1",
            name: "Acme",
            customer: { id: "customer-1", name: "Acme Co", externalId: null },
          },
          integration: { id: "integration-1", name: "Sync" },
          flow: { id: "flow-1", name: "Flow 1" },
        },
      ]) as never,
    );
    const page = await searchExecutions("legacy", {
      window,
      includeTests: false,
      conditions: [
        condition("instanceId", FilterOperator.Eq, "instance-1"),
        condition("status", FilterOperator.Eq, "error"),
        condition("resultType", FilterOperator.In, ["completed", "error"]),
        condition("error", FilterOperator.IsNull, false),
      ],
      sort: { field: "endedAt", direction: "asc" },
    });
    expect(variablesOf(0)).toMatchObject({
      instance: "instance-1",
      status: "ERROR",
      resultTypes: ["COMPLETED", "ERROR"],
      errorIsNull: false,
      isTestExecution: false,
      orderBy: { field: "ENDED_AT", direction: "ASC" },
    });
    expect(page.engine).toBe("legacy");
    expect(page.items[0]).toMatchObject({
      id: "execution-1",
      durationMs: 2500,
      instanceName: "Acme",
      customerName: "Acme Co",
      integrationName: "Sync",
      flowName: "Flow 1",
      errorStepName: null,
      allowReplay: true,
    });
  });

  it("names every condition the legacy API cannot express", async () => {
    await expect(
      searchExecutions("legacy", {
        window,
        includeTests: true,
        conditions: [
          condition("error", FilterOperator.Contains, "timeout"),
          condition("triggerPayload.order.id", FilterOperator.Eq, "1"),
        ],
      }),
    ).rejects.toMatchObject({
      code: "SEARCH_CAPABILITY_UNAVAILABLE",
      message: expect.stringContaining('error CONTAINS "timeout", triggerPayload.order.id EQ "1"'),
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("refuses sort fields the legacy API lacks", async () => {
    await expect(
      searchExecutions("legacy", {
        window,
        includeTests: true,
        conditions: [],
        sort: { field: "durationMs", direction: "desc" },
      }),
    ).rejects.toMatchObject({ code: "SEARCH_CAPABILITY_UNAVAILABLE" });
  });
});

describe("countExecutions", () => {
  it("uses KPIs on the search API and totalCount on legacy", async () => {
    request.mockResolvedValueOnce({ executionRunKpis: { count: 42 } } as never);
    expect(await countExecutions("search", { window, includeTests: true, conditions: [] })).toBe(
      42,
    );
    request.mockResolvedValueOnce({
      executionResults: {
        totalCount: 7,
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    } as never);
    expect(await countExecutions("legacy", { window, includeTests: true, conditions: [] })).toBe(7);
    expect(variablesOf(1)).toMatchObject({ first: 0 });
  });
});

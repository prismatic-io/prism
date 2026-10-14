import { describe, expect, it, vi } from "vitest";
import { FilterOperator } from "../../graphql/schema.generated.js";
import { gqlRequest } from "../../graphql.js";
import { listExecutionSteps, searchLogs } from "./events.js";
import { condition } from "./filters.js";

vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

const request = vi.mocked(gqlRequest);
const lastVariables = () =>
  (request.mock.calls.at(-1)?.[0] as { variables: Record<string, unknown> }).variables;
const window = { start: new Date("2026-09-16T11:00:00Z"), end: new Date("2026-09-16T12:00:00Z") };
const severities = {
  logSeverityLevels: [
    { id: 3, name: "Error" },
    { id: 6, name: "Info" },
  ],
};
const emptyEvents = {
  events: { totalCount: 0, nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
};
const emptyLogs = {
  logs: { totalCount: 0, nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
};

describe("searchLogs", () => {
  it("maps severity names to ids and adds the Designer test-exclusion group on the search API", async () => {
    request.mockImplementation(async ({ document }) => {
      const name = (
        document as { definitions: Array<{ name?: { value: string } }> }
      ).definitions.find((definition) => definition.name)?.name?.value;
      return (name === "logSeverityLevels" ? severities : emptyEvents) as never;
    });
    await searchLogs("search", {
      window,
      includeTests: false,
      direction: "desc",
      conditions: [
        condition("severity", FilterOperator.Eq, "error"),
        condition("message", FilterOperator.Contains, "timeout"),
      ],
    });
    expect(lastVariables()).toMatchObject({
      filterGroups: [
        {
          operator: "AND",
          filters: [
            { keyPath: "severity", operator: "EQ", value: 3 },
            { keyPath: "message", operator: "CONTAINS", value: "timeout" },
          ],
        },
        {
          operator: "OR",
          filters: [
            { keyPath: "isTestExecution", operator: "EQ", value: false },
            { keyPath: "isTestExecution", operator: "IS_NULL", value: true },
          ],
        },
      ],
      orderBy: { field: "TIMESTAMP", direction: "DESC" },
    });
  });

  it("translates legacy log filters and rejects the rest", async () => {
    request.mockImplementation(async ({ document }) => {
      const name = (
        document as { definitions: Array<{ name?: { value: string } }> }
      ).definitions.find((definition) => definition.name)?.name?.value;
      return (name === "logSeverityLevels" ? severities : emptyLogs) as never;
    });
    await searchLogs("legacy", {
      window,
      includeTests: false,
      direction: "asc",
      conditions: [
        condition("severity", FilterOperator.Eq, "info"),
        condition("message", FilterOperator.Contains, "token"),
        condition("logType", FilterOperator.Eq, "connection"),
        condition("instanceId", FilterOperator.Eq, "instance-1"),
      ],
    });
    expect(lastVariables()).toMatchObject({
      severity: 6,
      message: "token",
      logType: "CONNECTION",
      instance: "instance-1",
      isTestExecution: false,
      timestampGte: "2026-09-16T11:00:00.000Z",
    });
    await expect(
      searchLogs("legacy", {
        window,
        includeTests: true,
        direction: "asc",
        conditions: [condition("stepName", FilterOperator.Eq, "trigger")],
      }),
    ).rejects.toMatchObject({ code: "SEARCH_CAPABILITY_UNAVAILABLE" });
  });
});

describe("listExecutionSteps", () => {
  it("scopes search API events to step results and reads legacy hasError", async () => {
    request.mockResolvedValueOnce({
      executionRun: {
        id: "execution-1",
        status: "ERROR",
        endedAt: null,
        events: {
          totalCount: 1,
          nodes: [
            {
              __typename: "StepResultEvent",
              id: "step-1",
              timestamp: "2026-09-16T11:00:01.000Z",
              stepName: "fetch",
              stepDisplayName: "Fetch",
              startedAt: "2026-09-16T11:00:00.000Z",
              endedAt: "2026-09-16T11:00:01.250Z",
              hasError: true,
              hasStoredPayload: true,
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    } as never);
    const page = await listExecutionSteps("search", "execution-1", {
      conditions: [condition("hasError", FilterOperator.Eq, true)],
      direction: "asc",
    });
    expect(lastVariables()).toMatchObject({
      typeIn: ["STEP_RESULT"],
      orderBy: { field: "OCCURRED_AT" },
    });
    expect(page.items[0]).toMatchObject({ stepName: "fetch", durationMs: 1250, hasError: true });

    request.mockResolvedValueOnce({
      executionResult: {
        id: "execution-1",
        stepResults: {
          totalCount: 0,
          nodes: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    } as never);
    await listExecutionSteps("legacy", "execution-1", {
      conditions: [condition("hasError", FilterOperator.Eq, true)],
      direction: "asc",
    });
    expect(lastVariables()).toMatchObject({ id: "execution-1", hasError: true });
  });
});

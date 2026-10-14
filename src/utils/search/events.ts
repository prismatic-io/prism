import { Errors } from "incur";
import {
  EventOrderField,
  EventType,
  FilterOperator,
  type InstanceType,
  LogicalOperator,
  LogOrderField,
  OrderDirection,
} from "../../graphql/schema.generated.js";
import {
  ExecutionRunEventsDocument as EXECUTION_RUN_EVENTS,
  type ExecutionRunEventsQuery,
} from "../../graphql/search/executionRunEvents.generated.js";
import {
  LegacyExecutionStepsDocument as LEGACY_EXECUTION_STEPS,
  type LegacyExecutionStepsQuery,
} from "../../graphql/search/legacyExecutionSteps.generated.js";
import {
  LegacyLogsDocument as LEGACY_LOGS,
  type LegacyLogsQuery,
  type LegacyLogsQueryVariables,
} from "../../graphql/search/legacyLogs.generated.js";
import {
  LogSeverityLevelsDocument as LOG_SEVERITY_LEVELS,
  type LogSeverityLevelsQuery,
} from "../../graphql/search/logSeverityLevels.generated.js";
import {
  SearchLogEventsDocument as SEARCH_LOG_EVENTS,
  type SearchLogEventsQuery,
} from "../../graphql/search/searchLogEvents.generated.js";
import { gqlRequest } from "../../graphql.js";
import { type SearchEngine, unsupportedOnLegacy } from "./engine.js";
import { type Condition, condition, describeCondition, toFilterGroups } from "./filters.js";
import { HOUR_MS, type TimeWindow } from "./window.js";

export const LEGACY_LOG_WINDOW_MS = 48 * HOUR_MS;

export interface LogRow {
  id: string;
  timestamp: string;
  severity: string;
  message: string;
  logType: string | null;
  stepName: string | null;
  loopStepName: string | null;
  loopStepIndex: number | null;
  executionId: string | null;
  instanceId: string | null;
  instanceName: string | null;
  customerName: string | null;
  integrationName: string | null;
  flowName: string | null;
}

export interface StepRow {
  id: string;
  stepName: string;
  displayName: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number | null;
  hasError: boolean;
  errorCode: string | null;
  componentKey: string | null;
  actionKey: string | null;
  branchName: string | null;
  loopStepName: string | null;
  loopStepIndex: number | null;
  isLoopStep: boolean | null;
  loopIterationCount: number | null;
  isRootResult: boolean | null;
  hasStoredPayload: boolean;
}

export interface EventPage<T> {
  engine: SearchEngine;
  items: T[];
  totalCount: number | null;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export interface LogSearchRequest {
  window: TimeWindow;
  conditions: Condition[];
  includeTests: boolean;
  direction: "asc" | "desc";
  first?: number;
  after?: string | null;
}

let severityLevels: Promise<Map<string, number>> | undefined;

export const severityId = async (name: string): Promise<number> => {
  severityLevels ??= gqlRequest({ document: LOG_SEVERITY_LEVELS }).then(
    ({ logSeverityLevels }: LogSeverityLevelsQuery) =>
      new Map(
        logSeverityLevels.flatMap((level) =>
          level?.name && level.id !== null && level.id !== undefined
            ? [[level.name.toUpperCase(), level.id]]
            : [],
        ),
      ),
  );
  const id = (await severityLevels).get(name.toUpperCase());
  if (id === undefined)
    throw new Errors.IncurError({
      code: "INVALID_SEVERITY",
      exitCode: 2,
      retryable: false,
      message: `Unknown log severity '${name}'.`,
      hint: "Run 'prism logs severities list' to see the valid names.",
    });
  return id;
};

const durationBetween = (startedAt: string | null, endedAt: string | null) =>
  startedAt && endedAt ? new Date(endedAt).getTime() - new Date(startedAt).getTime() : null;

type LogEventNode = Extract<
  SearchLogEventsQuery["events"]["nodes"][number],
  { __typename: "LogEvent" }
>;
type RunEventNode = NonNullable<ExecutionRunEventsQuery["executionRun"]>["events"]["nodes"][number];
type StepEventNode = Extract<RunEventNode, { __typename: "StepResultEvent" }>;
type LegacyLogNode = NonNullable<LegacyLogsQuery["logs"]["nodes"][number]>;
type LegacyStepNode = NonNullable<
  NonNullable<LegacyExecutionStepsQuery["executionResult"]>["stepResults"]["nodes"][number]
>;

const fromLogEvent = (node: LogEventNode): LogRow => ({
  id: node.id,
  timestamp: node.timestamp,
  severity: node.severity ?? "INFO",
  message: node.message,
  logType: node.logType ?? null,
  stepName: node.stepName ?? null,
  loopStepName: node.loopStepName ?? null,
  loopStepIndex: node.loopStepIndex ?? null,
  executionId: node.executionResultId ?? null,
  instanceId: node.instanceId ?? null,
  instanceName: node.instanceName ?? null,
  customerName: node.customerName ?? null,
  integrationName: node.integrationName ?? null,
  flowName: node.flowName ?? null,
});

const fromLegacyLog = (node: LegacyLogNode): LogRow => ({
  id: node.id,
  timestamp: node.timestamp,
  severity: node.severity,
  message: node.message,
  logType: node.logType ?? null,
  stepName: node.stepName ?? null,
  loopStepName: node.loopStepName ?? null,
  loopStepIndex: node.loopStepIndex ?? null,
  executionId: node.executionResultId ?? null,
  instanceId: node.instanceId ?? null,
  instanceName: node.instanceName ?? null,
  customerName: node.customerName ?? null,
  integrationName: node.integrationName ?? null,
  flowName: node.flowName ?? null,
});

const fromStepEvent = (node: StepEventNode): StepRow => ({
  id: node.id,
  stepName: node.stepName ?? "",
  displayName: node.stepDisplayName ?? null,
  startedAt: node.startedAt ?? null,
  endedAt: node.endedAt ?? null,
  durationMs: durationBetween(node.startedAt ?? null, node.endedAt ?? null),
  hasError: node.hasError ?? false,
  errorCode: node.errorCode ?? null,
  componentKey: node.componentKey ?? null,
  actionKey: node.actionKey ?? null,
  branchName: node.branchName ?? null,
  loopStepName: node.loopStepName ?? null,
  loopStepIndex: node.loopStepIndex ?? null,
  isLoopStep: node.isLoopStep ?? null,
  loopIterationCount: node.loopIterationCount ?? null,
  isRootResult: node.isRootResult ?? null,
  hasStoredPayload: node.hasStoredPayload,
});

const fromLegacyStep = (node: LegacyStepNode): StepRow => ({
  id: node.id,
  stepName: node.stepName ?? "",
  displayName: node.displayStepName ?? null,
  startedAt: node.startedAt,
  endedAt: node.endedAt ?? null,
  durationMs: durationBetween(node.startedAt, node.endedAt ?? null),
  hasError: node.hasError,
  errorCode: null,
  componentKey: null,
  actionKey: null,
  branchName: node.branchName ?? null,
  loopStepName: node.loopStepName ?? null,
  loopStepIndex: node.loopStepIndex ?? null,
  isLoopStep: node.isLoopStep ?? null,
  loopIterationCount: null,
  isRootResult: node.isRootResult ?? null,
  hasStoredPayload: Boolean(node.resultsUrl),
});

const executionNotFound = (id: string) =>
  new Errors.IncurError({
    code: "EXECUTION_NOT_FOUND",
    exitCode: 1,
    retryable: false,
    message: `No execution '${id}' was found.`,
    hint: "Run 'prism executions list' to find execution IDs.",
  });

const order = (direction: "asc" | "desc") =>
  direction === "asc" ? OrderDirection.Asc : OrderDirection.Desc;

const testExclusionGroup = {
  operator: LogicalOperator.Or,
  filters: [
    condition("isTestExecution", FilterOperator.Eq, false),
    condition("isTestExecution", FilterOperator.IsNull, true),
  ],
};

export interface ExecutionEventsRequest {
  conditions: Condition[];
  direction: "asc" | "desc";
  first?: number;
  after?: string | null;
}

export async function listExecutionSteps(
  engine: SearchEngine,
  id: string,
  request: ExecutionEventsRequest,
): Promise<EventPage<StepRow>> {
  if (engine === "legacy") {
    let hasError: boolean | null = null;
    const unsupported: string[] = [];
    for (const item of request.conditions) {
      if (item.keyPath === "hasError" && item.operator === FilterOperator.Eq)
        hasError = Boolean(item.value);
      else unsupported.push(describeCondition(item));
    }
    if (unsupported.length)
      throw unsupportedOnLegacy([`step filters on ${unsupported.join(", ")}`]);
    if (request.direction === "desc") throw unsupportedOnLegacy(["newest-first step results"]);
    const { executionResult }: LegacyExecutionStepsQuery = await gqlRequest({
      document: LEGACY_EXECUTION_STEPS,
      variables: { id, first: request.first ?? null, after: request.after ?? null, hasError },
    });
    if (!executionResult) throw executionNotFound(id);
    const { stepResults } = executionResult;
    return {
      engine,
      items: stepResults.nodes
        .filter((node): node is LegacyStepNode => node !== null)
        .map(fromLegacyStep),
      totalCount: stepResults.totalCount,
      pageInfo: {
        hasNextPage: stepResults.pageInfo.hasNextPage,
        endCursor: stepResults.pageInfo.endCursor ?? null,
      },
    };
  }
  const { executionRun }: ExecutionRunEventsQuery = await gqlRequest({
    document: EXECUTION_RUN_EVENTS,
    variables: {
      id,
      first: request.first ?? null,
      after: request.after ?? null,
      typeIn: [EventType.StepResult],
      filterGroups: toFilterGroups(request.conditions),
      orderBy: { field: EventOrderField.OccurredAt, direction: order(request.direction) },
    },
  });
  if (!executionRun) throw executionNotFound(id);
  const { events } = executionRun;
  return {
    engine,
    items: events.nodes
      .filter((node): node is StepEventNode => node.__typename === "StepResultEvent")
      .map(fromStepEvent),
    totalCount: events.totalCount,
    pageInfo: {
      hasNextPage: events.pageInfo.hasNextPage,
      endCursor: events.pageInfo.endCursor ?? null,
    },
  };
}

type LegacyLogVariables = Omit<LegacyLogsQueryVariables, "first" | "after" | "orderBy">;

async function legacyLogVariables(
  conditions: Condition[],
  includeTests: boolean,
): Promise<LegacyLogVariables> {
  const variables: LegacyLogVariables = { isTestExecution: includeTests ? null : false };
  const unsupported: string[] = [];
  for (const item of conditions) {
    const { keyPath, operator, value } = item;
    const single = operator === FilterOperator.Eq;
    if (keyPath === "executionId" && single) variables.executionResult = String(value);
    else if (keyPath === "instanceId" && single) variables.instance = String(value);
    else if (keyPath === "customerId" && single) variables.customer = String(value);
    else if (keyPath === "integrationId" && single) variables.integration = String(value);
    else if (keyPath === "flowId" && single) variables.flow = String(value);
    else if (keyPath === "flowConfigId" && single) variables.flowConfig = String(value);
    else if (keyPath === "severity" && single) variables.severity = await severityId(String(value));
    else if (keyPath === "message" && operator === FilterOperator.Contains)
      variables.message = String(value);
    else if (keyPath === "logType" && single) variables.logType = String(value).toUpperCase();
    else if (keyPath === "logType" && operator === FilterOperator.In)
      variables.logTypes = (Array.isArray(value) ? value : [value]).map((item) =>
        String(item).toUpperCase(),
      );
    else if (keyPath === "isTestExecution" && single) variables.isTestExecution = Boolean(value);
    else if (keyPath === "instanceType" && single)
      variables.instanceType = String(value).toUpperCase() as InstanceType;
    else unsupported.push(describeCondition(item));
  }
  if (unsupported.length) throw unsupportedOnLegacy([`log filters on ${unsupported.join(", ")}`]);
  return variables;
}

const normalizeLogConditions = async (conditions: Condition[]) =>
  Promise.all(
    conditions.map(async (item) => {
      if (item.keyPath === "severity" && typeof item.value === "string")
        return { ...item, value: await severityId(item.value) };
      if (item.keyPath === "logType" && typeof item.value === "string")
        return { ...item, value: item.value.toUpperCase() };
      return item;
    }),
  );

export async function searchLogs(
  engine: SearchEngine,
  request: LogSearchRequest,
): Promise<EventPage<LogRow>> {
  if (engine === "legacy") {
    const { logs }: LegacyLogsQuery = await gqlRequest({
      document: LEGACY_LOGS,
      variables: {
        ...(await legacyLogVariables(request.conditions, request.includeTests)),
        timestampGte: request.window.start.toISOString(),
        timestampLte: request.window.end.toISOString(),
        first: request.first ?? null,
        after: request.after ?? null,
        orderBy: { field: LogOrderField.Timestamp, direction: order(request.direction) },
      },
    });
    return {
      engine,
      items: logs.nodes.filter((node): node is LegacyLogNode => node !== null).map(fromLegacyLog),
      totalCount: logs.totalCount,
      pageInfo: {
        hasNextPage: logs.pageInfo.hasNextPage,
        endCursor: logs.pageInfo.endCursor ?? null,
      },
    };
  }
  const conditions = await normalizeLogConditions(request.conditions);
  const groups = toFilterGroups(conditions) ?? [];
  const { events }: SearchLogEventsQuery = await gqlRequest({
    document: SEARCH_LOG_EVENTS,
    variables: {
      first: request.first ?? null,
      after: request.after ?? null,
      timestampGte: request.window.start.toISOString(),
      timestampLte: request.window.end.toISOString(),
      filterGroups: request.includeTests ? groups : [...groups, testExclusionGroup],
      orderBy: { field: EventOrderField.Timestamp, direction: order(request.direction) },
    },
  });
  return {
    engine,
    items: events.nodes
      .filter((node): node is LogEventNode => node.__typename === "LogEvent")
      .map(fromLogEvent),
    totalCount: events.totalCount,
    pageInfo: {
      hasNextPage: events.pageInfo.hasNextPage,
      endCursor: events.pageInfo.endCursor ?? null,
    },
  };
}

export async function listExecutionLogs(
  engine: SearchEngine,
  id: string,
  request: ExecutionEventsRequest,
): Promise<EventPage<LogRow>> {
  if (engine === "legacy") {
    const { logs }: LegacyLogsQuery = await gqlRequest({
      document: LEGACY_LOGS,
      variables: {
        ...(await legacyLogVariables(request.conditions, true)),
        executionResult: id,
        first: request.first ?? null,
        after: request.after ?? null,
        orderBy: { field: LogOrderField.Timestamp, direction: order(request.direction) },
      },
    });
    return {
      engine,
      items: logs.nodes.filter((node): node is LegacyLogNode => node !== null).map(fromLegacyLog),
      totalCount: logs.totalCount,
      pageInfo: {
        hasNextPage: logs.pageInfo.hasNextPage,
        endCursor: logs.pageInfo.endCursor ?? null,
      },
    };
  }
  const { executionRun }: ExecutionRunEventsQuery = await gqlRequest({
    document: EXECUTION_RUN_EVENTS,
    variables: {
      id,
      first: request.first ?? null,
      after: request.after ?? null,
      typeIn: [EventType.LogEvent],
      filterGroups: toFilterGroups(await normalizeLogConditions(request.conditions)),
      orderBy: { field: EventOrderField.Timestamp, direction: order(request.direction) },
    },
  });
  if (!executionRun) throw executionNotFound(id);
  const { events } = executionRun;
  return {
    engine,
    items: events.nodes
      .filter((node): node is LogEventNode => node.__typename === "LogEvent")
      .map(fromLogEvent),
    totalCount: events.totalCount,
    pageInfo: {
      hasNextPage: events.pageInfo.hasNextPage,
      endCursor: events.pageInfo.endCursor ?? null,
    },
  };
}

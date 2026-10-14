import { Errors } from "incur";
import {
  ExecutionRunOrderField,
  type ExecutionStatus,
  FilterOperator,
  InstanceExecutionResultOrderField,
  type InstanceType,
  OrderDirection,
} from "../../graphql/schema.generated.js";
import {
  CountExecutionRunsDocument as COUNT_EXECUTION_RUNS,
  type CountExecutionRunsQuery,
} from "../../graphql/search/countExecutionRuns.generated.js";
import {
  ExecutionRunFilterFieldsDocument as EXECUTION_RUN_FILTER_FIELDS,
  type ExecutionRunFilterFieldsQuery,
} from "../../graphql/search/executionRunFilterFields.generated.js";
import {
  GetExecutionRunDocument as GET_EXECUTION_RUN,
  type GetExecutionRunQuery,
} from "../../graphql/search/getExecutionRun.generated.js";
import {
  LegacyExecutionResultDocument as LEGACY_EXECUTION_RESULT,
  type LegacyExecutionResultQuery,
} from "../../graphql/search/legacyExecutionResult.generated.js";
import {
  LegacyExecutionResultsDocument as LEGACY_EXECUTION_RESULTS,
  type LegacyExecutionResultsQuery,
  type LegacyExecutionResultsQueryVariables,
} from "../../graphql/search/legacyExecutionResults.generated.js";
import {
  SearchExecutionRunsDocument as SEARCH_EXECUTION_RUNS,
  type SearchExecutionRunsQuery,
} from "../../graphql/search/searchExecutionRuns.generated.js";
import { gqlRequest } from "../../graphql.js";
import { type SearchEngine, unsupportedOnLegacy } from "./engine.js";
import { type Condition, condition, describeCondition, toFilterGroups } from "./filters.js";
import { DAY_MS, type TimeWindow } from "./window.js";

export const EXECUTION_RETENTION_MS = 14 * DAY_MS;

export interface ExecutionSort {
  field: string;
  direction: "asc" | "desc";
}

export interface ExecutionSearchRequest {
  window: TimeWindow;
  conditions: Condition[];
  includeTests: boolean;
  sort?: ExecutionSort;
  first?: number;
  after?: string | null;
}

export interface ExecutionRow {
  id: string;
  status: string;
  resultType: string | null;
  invokeType: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  stepCount: number | null;
  error: string | null;
  errorStepName: string | null;
  instanceId: string | null;
  instanceName: string | null;
  customerId: string | null;
  customerName: string | null;
  customerExternalId: string | null;
  integrationId: string | null;
  integrationName: string | null;
  flowId: string | null;
  flowName: string | null;
  isTestExecution: boolean | null;
  isReplay: boolean | null;
  retryAttemptNumber: number | null;
  retryForExecutionId: string | null;
  allowReplay: boolean;
}

export interface ExecutionPage {
  engine: SearchEngine;
  items: ExecutionRow[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

const sortFields: Record<string, ExecutionRunOrderField> = {
  startedAt: ExecutionRunOrderField.StartedAt,
  endedAt: ExecutionRunOrderField.EndedAt,
  queuedAt: ExecutionRunOrderField.QueuedAt,
  resumedAt: ExecutionRunOrderField.ResumedAt,
  durationMs: ExecutionRunOrderField.DurationMs,
  stepCount: ExecutionRunOrderField.StepCount,
  status: ExecutionRunOrderField.Status,
  resultType: ExecutionRunOrderField.ResultType,
  invokeType: ExecutionRunOrderField.InvokeType,
  customerName: ExecutionRunOrderField.CustomerName,
  instanceName: ExecutionRunOrderField.InstanceName,
  integrationName: ExecutionRunOrderField.IntegrationName,
  flowName: ExecutionRunOrderField.FlowName,
  errorStepName: ExecutionRunOrderField.ErrorStepName,
};

export const executionSortFields = Object.keys(sortFields);

const legacySortFields: Record<string, InstanceExecutionResultOrderField> = {
  startedAt: InstanceExecutionResultOrderField.StartedAt,
  endedAt: InstanceExecutionResultOrderField.EndedAt,
};

const direction = (sort: ExecutionSort | undefined) =>
  sort?.direction === "asc" ? OrderDirection.Asc : OrderDirection.Desc;

const upper = (value: unknown) => (typeof value === "string" ? value.toUpperCase() : value);

const enumKeys = new Set(["status", "resultType", "invokeType", "instanceType"]);

const normalizeCondition = (item: Condition): Condition => {
  if (!enumKeys.has(item.keyPath)) return item;
  return { ...item, value: Array.isArray(item.value) ? item.value.map(upper) : upper(item.value) };
};

const durationBetween = (startedAt: string, endedAt: string | null) =>
  endedAt ? new Date(endedAt).getTime() - new Date(startedAt).getTime() : null;

type RunNode = SearchExecutionRunsQuery["executionRuns"]["edges"][number]["node"];
type LegacyNode = NonNullable<LegacyExecutionResultsQuery["executionResults"]["nodes"][number]>;

const fromRun = (node: RunNode): ExecutionRow => ({
  id: node.id,
  status: node.status,
  resultType: node.resultType ?? null,
  invokeType: node.invokeType ?? null,
  startedAt: node.startedAt,
  endedAt: node.endedAt ?? null,
  durationMs: node.durationMs ?? null,
  stepCount: node.stepCount ?? null,
  error: node.error ?? null,
  errorStepName: node.errorStepName ?? null,
  instanceId: node.instanceId ?? null,
  instanceName: node.instanceName ?? null,
  customerId: node.customerId ?? null,
  customerName: node.customerName ?? null,
  customerExternalId: node.customerExternalId ?? null,
  integrationId: node.integrationId ?? null,
  integrationName: node.integrationName ?? null,
  flowId: node.flowId ?? null,
  flowName: node.flowName ?? null,
  isTestExecution: node.isTestExecution ?? null,
  isReplay: node.isReplay ?? null,
  retryAttemptNumber: node.retryAttemptNumber ?? null,
  retryForExecutionId: node.retryForExecutionId ?? null,
  allowReplay: node.allowUpdate,
});

const fromLegacy = (node: LegacyNode): ExecutionRow => ({
  id: node.id,
  status: node.status,
  resultType: node.resultType ?? null,
  invokeType: node.invokeType ?? null,
  startedAt: node.startedAt,
  endedAt: node.endedAt ?? null,
  durationMs: durationBetween(node.startedAt, node.endedAt ?? null),
  stepCount: node.stepCount ?? null,
  error: node.error ?? null,
  errorStepName: null,
  instanceId: node.instance?.id ?? null,
  instanceName: node.instance?.name ?? null,
  customerId: node.instance?.customer?.id ?? null,
  customerName: node.instance?.customer?.name ?? null,
  customerExternalId: node.instance?.customer?.externalId ?? null,
  integrationId: node.integration?.id ?? null,
  integrationName: node.integration?.name ?? null,
  flowId: node.flow?.id ?? null,
  flowName: node.flow?.name ?? null,
  isTestExecution: node.isTestExecution,
  isReplay: !!node.replayForExecution,
  retryAttemptNumber: node.retryCount ?? null,
  retryForExecutionId: node.retryForExecution?.id ?? null,
  allowReplay: node.allowUpdate,
});

const testExclusion = condition("isTestExecution", FilterOperator.NotEq, true);

const searchApiConditions = (request: ExecutionSearchRequest) =>
  [...(request.includeTests ? [] : [testExclusion]), ...request.conditions].map(normalizeCondition);

type LegacyVariables = Omit<LegacyExecutionResultsQueryVariables, "first" | "after" | "orderBy">;

function legacyVariables(request: ExecutionSearchRequest): LegacyVariables {
  const variables: LegacyVariables = {
    startedAtGte: request.window.start.toISOString(),
    startedAtLte: request.window.end.toISOString(),
    isTestExecution: request.includeTests ? null : false,
  };
  const unsupported: string[] = [];
  const list = (value: unknown) =>
    (Array.isArray(value) ? value : [value]).map((item) => String(upper(item)));
  for (const item of request.conditions.map(normalizeCondition)) {
    const { keyPath, operator, value } = item;
    const single = operator === FilterOperator.Eq;
    const isNull = operator === FilterOperator.IsNull;
    const asId = () => String(value);
    if (keyPath === "executionId" && single) variables.id = asId();
    else if (keyPath === "instanceId" && single) variables.instance = asId();
    else if (keyPath === "customerId" && single) variables.customer = asId();
    else if (keyPath === "integrationId" && single) variables.integration = asId();
    else if (keyPath === "flowId" && single) variables.flow = asId();
    else if (keyPath === "integrationVersionSequenceId" && single)
      variables.integrationVersionSequenceId = asId();
    else if (keyPath === "status" && single) variables.status = String(value) as ExecutionStatus;
    else if (keyPath === "resultType" && (single || operator === FilterOperator.In))
      variables.resultTypes = list(value);
    else if (keyPath === "invokeType" && (single || operator === FilterOperator.In))
      variables.invokeTypes = list(value);
    else if (keyPath === "instanceType" && single)
      variables.instanceType = String(value) as InstanceType;
    else if (keyPath === "isTestExecution" && single) variables.isTestExecution = Boolean(value);
    else if (keyPath === "endedAt" && isNull) variables.endedAtIsNull = Boolean(value);
    else if (keyPath === "error" && isNull) variables.errorIsNull = Boolean(value);
    else if (keyPath === "retryForExecutionId" && isNull)
      variables.retryForExecutionIsNull = Boolean(value);
    else unsupported.push(describeCondition(item));
  }
  if (unsupported.length) throw unsupportedOnLegacy([`filters on ${unsupported.join(", ")}`]);
  return variables;
}

export async function searchExecutions(
  engine: SearchEngine,
  request: ExecutionSearchRequest,
): Promise<ExecutionPage> {
  if (engine === "legacy") {
    const field = request.sort ? legacySortFields[request.sort.field] : undefined;
    if (request.sort && !field)
      throw unsupportedOnLegacy([
        `sorting by ${request.sort.field} (only startedAt and endedAt are available)`,
      ]);
    const { executionResults }: LegacyExecutionResultsQuery = await gqlRequest({
      document: LEGACY_EXECUTION_RESULTS,
      variables: {
        ...legacyVariables(request),
        first: request.first ?? null,
        after: request.after ?? null,
        orderBy: {
          field: field ?? InstanceExecutionResultOrderField.StartedAt,
          direction: direction(request.sort),
        },
      },
    });
    return {
      engine,
      items: executionResults.nodes
        .filter((node): node is LegacyNode => node !== null)
        .map(fromLegacy),
      pageInfo: {
        hasNextPage: executionResults.pageInfo.hasNextPage,
        endCursor: executionResults.pageInfo.endCursor ?? null,
      },
    };
  }
  const field = request.sort ? sortFields[request.sort.field] : undefined;
  if (request.sort && !field)
    throw new Errors.IncurError({
      code: "INVALID_SORT",
      exitCode: 2,
      retryable: false,
      message: `Cannot sort executions by '${request.sort.field}'.`,
      hint: `Choose one of: ${executionSortFields.join(", ")}.`,
    });
  const { executionRuns }: SearchExecutionRunsQuery = await gqlRequest({
    document: SEARCH_EXECUTION_RUNS,
    variables: {
      first: request.first ?? null,
      after: request.after ?? null,
      startedAtGte: request.window.start.toISOString(),
      startedAtLte: request.window.end.toISOString(),
      filterGroups: toFilterGroups(searchApiConditions(request)),
      orderBy: field ? { field, direction: direction(request.sort) } : null,
    },
  });
  return {
    engine,
    items: executionRuns.edges.map(({ node }) => fromRun(node)),
    pageInfo: {
      hasNextPage: executionRuns.pageInfo.hasNextPage,
      endCursor: executionRuns.pageInfo.endCursor ?? null,
    },
  };
}

export async function countExecutions(
  engine: SearchEngine,
  request: Omit<ExecutionSearchRequest, "sort" | "first" | "after">,
): Promise<number> {
  if (engine === "legacy") {
    const { executionResults }: LegacyExecutionResultsQuery = await gqlRequest({
      document: LEGACY_EXECUTION_RESULTS,
      variables: { ...legacyVariables(request), first: 0 },
    });
    return executionResults.totalCount;
  }
  const { executionRunKpis }: CountExecutionRunsQuery = await gqlRequest({
    document: COUNT_EXECUTION_RUNS,
    variables: {
      startedAtGte: request.window.start.toISOString(),
      startedAtLte: request.window.end.toISOString(),
      filterGroups: toFilterGroups(searchApiConditions(request)),
    },
  });
  return executionRunKpis.count;
}

export type ExecutionDetail = ExecutionRow & {
  engine: SearchEngine;
  queuedAt: string | null;
  resumedAt: string | null;
  instanceType: string | null;
  integrationVersionSequenceId: string | null;
  flowStableId: string | null;
  flowConfigId: string | null;
  isCodeNative: boolean | null;
  usesBatching: boolean | null;
  fromPreprocessFlow: boolean | null;
  invokedByExecutionId: string | null;
  payload: unknown;
  payloadTruncated: boolean | null;
  hasStoredPayload: boolean;
  stepBuckets: GetExecutionRunQuery["executionRun"] extends infer R
    ? R extends { stepBuckets: infer B }
      ? B
      : never
    : never;
};

const parseJson = (value: string | null | undefined): unknown => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const executionNotFound = (id: string) =>
  new Errors.IncurError({
    code: "EXECUTION_NOT_FOUND",
    exitCode: 1,
    retryable: false,
    message: `No execution '${id}' was found.`,
    hint: "Run 'prism executions list' to find execution IDs. The search API keeps 14 days of executions.",
  });

export async function getExecution(engine: SearchEngine, id: string): Promise<ExecutionDetail> {
  if (engine === "legacy") {
    const { executionResult }: LegacyExecutionResultQuery = await gqlRequest({
      document: LEGACY_EXECUTION_RESULT,
      variables: { id },
    });
    if (!executionResult) throw executionNotFound(id);
    const node = executionResult;
    return {
      ...fromLegacy({ ...node, retryCount: node.retryCount }),
      engine,
      queuedAt: node.queuedAt ?? null,
      resumedAt: node.resumedAt ?? null,
      instanceType: node.instanceType ?? null,
      integrationVersionSequenceId: node.integration?.versionSequenceId ?? null,
      flowStableId: node.flow?.stableKey ?? null,
      flowConfigId: null,
      isCodeNative: null,
      usesBatching: node.usesBatching ?? null,
      fromPreprocessFlow: null,
      invokedByExecutionId: node.lineage.invokedBy?.execution?.id ?? null,
      payload: null,
      payloadTruncated: null,
      hasStoredPayload: Boolean(node.requestPayloadUrl),
      stepBuckets: [],
    };
  }
  const { executionRun }: GetExecutionRunQuery = await gqlRequest({
    document: GET_EXECUTION_RUN,
    variables: { id },
  });
  if (!executionRun) throw executionNotFound(id);
  return {
    ...fromRun(executionRun),
    engine,
    queuedAt: executionRun.queuedAt ?? null,
    resumedAt: executionRun.resumedAt ?? null,
    instanceType: executionRun.instanceType ?? null,
    integrationVersionSequenceId: executionRun.integrationVersionSequenceId ?? null,
    flowStableId: executionRun.flowStableId ?? null,
    flowConfigId: executionRun.flowConfigId ?? null,
    isCodeNative: executionRun.isCodeNative ?? null,
    usesBatching: executionRun.usesBatching ?? null,
    fromPreprocessFlow: executionRun.fromPreprocessFlow ?? null,
    invokedByExecutionId: executionRun.lineage.invokedBy?.execution?.id ?? null,
    payload: parseJson(executionRun.payload),
    payloadTruncated: executionRun.payloadTruncated ?? null,
    hasStoredPayload: executionRun.hasStoredPayload,
    stepBuckets: executionRun.stepBuckets,
  };
}

export type FilterField = ExecutionRunFilterFieldsQuery["executionRunFilterFields"][number];

export async function listExecutionFilterFields(
  engine: SearchEngine,
  scope: { integrationId?: string; customerId?: string; instanceId?: string; keySearch?: string },
  window?: TimeWindow,
): Promise<FilterField[]> {
  if (engine === "legacy")
    throw unsupportedOnLegacy(["filter field and trigger payload key discovery"]);
  const { executionRunFilterFields }: ExecutionRunFilterFieldsQuery = await gqlRequest({
    document: EXECUTION_RUN_FILTER_FIELDS,
    variables: {
      integrationId: scope.integrationId ?? null,
      customerId: scope.customerId ?? null,
      instanceId: scope.instanceId ?? null,
      keySearch: scope.keySearch ?? null,
      startedAtGte: window?.start.toISOString() ?? null,
      startedAtLte: window?.end.toISOString() ?? null,
    },
  });
  return executionRunFilterFields;
}

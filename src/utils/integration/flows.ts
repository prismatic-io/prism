import inquirer from "inquirer";
import { gqlRequest } from "../../graphql.js";
import { handleError } from "../errors.js";
import { GET_INTEGRATION_FLOWS } from "../../graphql/integrations/getIntegrationFlows.js";
import type { GetIntegrationFlowsQuery } from "../../graphql/integrations/getIntegrationFlows.generated.js";
import { GET_EXECUTION_LOGS } from "../../graphql/executions/getExecutionLogs.js";
import type { GetExecutionLogsQuery } from "../../graphql/executions/getExecutionLogs.generated.js";
import { GET_EXECUTION_STEP_RESULTS } from "../../graphql/executions/getExecutionStepResults.js";
import type { GetExecutionStepResultsQuery } from "../../graphql/executions/getExecutionStepResults.generated.js";
import { IS_CNI_EXECUTION_COMPLETE } from "../../graphql/executions/isCniExecutionComplete.js";
import type { IsCniExecutionCompleteQuery } from "../../graphql/executions/isCniExecutionComplete.generated.js";

type IntegrationFlowNode = NonNullable<
  NonNullable<GetIntegrationFlowsQuery["integration"]>["flows"]["nodes"][number]
>;

export type IntegrationFlow = IntegrationFlowNode;

export async function getIntegrationFlows(integrationId: string): Promise<IntegrationFlow[]> {
  let flows: IntegrationFlow[] = [];
  let hasNextPage = true;
  let cursor: string | undefined = undefined;

  while (hasNextPage) {
    const result: GetIntegrationFlowsQuery = await gqlRequest<GetIntegrationFlowsQuery>({
      document: GET_INTEGRATION_FLOWS,
      variables: {
        id: integrationId,
        after: cursor,
      },
    });

    const integration = result.integration;
    if (!integration) break;

    const { nodes, pageInfo } = integration.flows;
    const validNodes = nodes.filter((n): n is IntegrationFlowNode => n !== null);
    flows = [...flows, ...validNodes];
    cursor = pageInfo.endCursor ?? undefined;
    hasNextPage = pageInfo.hasNextPage;
  }

  return flows;
}

export interface LogNode {
  [index: string]: unknown;
  timestamp: string;
  severity: string;
  message: string;
}

export interface FetchLogsResult {
  logs: LogNode[];
  cursor: string | undefined;
  executionComplete?: boolean;
}

export async function getExecutionLogs(executionId: string, nextCursor?: string) {
  return await gqlRequest<GetExecutionLogsQuery>({
    document: GET_EXECUTION_LOGS,
    variables: {
      executionId,
      nextCursor,
    },
  });
}

export interface StepResultNode {
  [index: string]: unknown;
  stepName: string;
  endedAt: string;
  resultsUrl: string;
}

export async function getExecutionStepResults(executionId: string, nextCursor?: string) {
  return await gqlRequest<GetExecutionStepResultsQuery>({
    document: GET_EXECUTION_STEP_RESULTS,
    variables: {
      executionId,
      nextCursor,
    },
  });
}

export async function isCniExecutionComplete(executionId: string) {
  const result = await gqlRequest<IsCniExecutionCompleteQuery>({
    document: IS_CNI_EXECUTION_COMPLETE,
    variables: {
      executionId,
    },
  });

  return result.executionResult?.stepResults.totalCount === 2;
}

export type SelectFlowOptions = {
  /** The prompt message to show the user */
  message?: string;
  /** Error message when no flows are found */
  noFlowsError?: string;
  /** Error message when lookup fails */
  lookupError?: string;
};

export type ResolveFlowOptions = {
  /** The integration ID to fetch flows from */
  integrationId: string;
  /** The flow ID to look up (mutually exclusive with flowName) */
  flowId?: string;
  /** The flow name to look up (mutually exclusive with flowId) */
  flowName?: string;
  /** The prompt message to show if prompting for selection */
  promptMessage?: string;
};

/**
 * Resolve a flow by ID, name, or prompt the user to select one.
 * @param options - Configuration for flow resolution
 * @returns The resolved flow
 * @throws If the flow cannot be found or resolved
 */
export async function resolveFlow(options: ResolveFlowOptions): Promise<IntegrationFlow> {
  const { integrationId, flowId, flowName, promptMessage = "Select a flow:" } = options;
  const hasFlowIdentifier = flowId || flowName;

  if (!hasFlowIdentifier) {
    return selectFlowPrompt(integrationId, { message: promptMessage });
  }

  const flows = await getIntegrationFlows(integrationId);
  const selectedFlow = flows.find((flow) => flow.id === flowId || flow.name === flowName);

  if (!selectedFlow) {
    handleError({
      message: `Could not find flow ${
        flowId ? `with ID ${flowId}` : `named "${flowName}"`
      }. Please verify that the given flow identifier is correct, or re-run without it to select from a list.`,
    });
  }

  return selectedFlow;
}

/**
 * Prompt the user to select a flow from an integration.
 * @param integrationId - The integration ID to fetch flows from
 * @param options - Optional configuration for prompts and error messages
 * @returns The selected flow, or throws if no flows or lookup fails
 */
export async function selectFlowPrompt(
  integrationId: string,
  options: SelectFlowOptions = {},
): Promise<IntegrationFlow> {
  const {
    message = "Select a flow:",
    noFlowsError = "No flows were found for the given integration.",
    lookupError = "There was an error looking up flows for your integration. Please provide an integration ID or reimport your integration.",
  } = options;

  try {
    const flows = await getIntegrationFlows(integrationId);

    if (flows.length === 0) {
      handleError({
        message: noFlowsError,
      });
    }

    const { selectedFlow } = await inquirer.prompt({
      type: "list",
      name: "selectedFlow",
      message,
      choices: flows.map((flow) => ({
        name: `${flow.name} ${flow.stableKey ? `(${flow.stableKey})` : ""}`,
        value: flow,
      })),
    });

    return selectedFlow;
  } catch (err) {
    handleError({
      message: lookupError,
    });
  }
}

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
        throwError: true,
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
    // Re-throw if it's our own error from handleError
    if (err instanceof Error && err.message === noFlowsError) {
      throw err;
    }
    handleError({
      message: lookupError,
      throwError: true,
    });
    throw err; // TypeScript needs this even though handleError throws
  }
}

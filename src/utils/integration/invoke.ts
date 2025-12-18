import { gqlRequest } from "../../graphql.js";
import { GET_INTEGRATION_FLOW } from "../../graphql/integrations/getIntegrationFlow.js";
import type { GetIntegrationFlowQuery } from "../../graphql/integrations/getIntegrationFlow.generated.js";
import { TEST_INTEGRATION_FLOW } from "../../graphql/integrations/testIntegrationFlow.js";
import type { TestIntegrationFlowMutation } from "../../graphql/integrations/testIntegrationFlow.generated.js";
import { DELETE_INTEGRATION } from "../../graphql/integrations/deleteIntegration.js";

/** Return Flow ID of given flow name on specified Integration. */
export const getIntegrationFlow = async (
  integrationId: string,
  flowName: string,
): Promise<string> => {
  // TODO: Make flows searchable by name.
  const result = await gqlRequest<GetIntegrationFlowQuery>({
    document: GET_INTEGRATION_FLOW,
    variables: { id: integrationId },
  });

  const integration = result.integration;
  if (!integration) {
    throw new Error(`Integration not found: ${integrationId}`);
  }

  const flows = integration.flows.nodes
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .map(({ id, name }) => ({
      id,
      name: name.toLowerCase().trim(),
    }))
    .filter(({ name }) => name === flowName);

  if (flows.length > 1) {
    throw new Error(`Found more than one result for Flow name: ${flowName}`);
  }
  if (flows.length === 0) {
    throw new Error(`Failed to find a Flow with the given name: ${flowName}`);
  }

  return flows[0].id;
};

/** Delete a specified integration by ID */
export const deleteIntegration = async (integrationId: string) => {
  await gqlRequest({
    document: DELETE_INTEGRATION,
    variables: { id: integrationId },
  });
};

interface IntegrationFlowRunProps {
  integrationId: string;
  flowId?: string;
  flowName?: string;
}

interface IntegrationFlowRunResult {
  executionId: string;
}

export const runIntegrationFlow = async ({
  integrationId,
  flowId,
  flowName,
}: IntegrationFlowRunProps): Promise<IntegrationFlowRunResult> => {
  const integrationFlowId = flowName ? await getIntegrationFlow(integrationId, flowName) : flowId;

  if (!integrationFlowId) {
    throw new Error("Either flowId or flowName must be provided");
  }

  const result = await gqlRequest<TestIntegrationFlowMutation>({
    document: TEST_INTEGRATION_FLOW,
    variables: { id: integrationFlowId },
  });

  const executionId = result.testIntegrationFlow?.testIntegrationFlowResult?.execution?.id;
  if (!executionId) {
    throw new Error("Failed to get execution ID from test integration flow result");
  }
  return { executionId };
};

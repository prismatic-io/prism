import { gqlRequest } from "../../graphql.js";
import {
  GetIntegrationFlowDocument,
  type GetIntegrationFlowQuery,
  TestIntegrationFlowDocument,
  type TestIntegrationFlowMutation,
  DeleteIntegrationDocument,
} from "../../graphql/integrations.generated.js";

/** Return Flow ID of given flow name on specified Integration. */
export const getIntegrationFlow = async (
  integrationId: string,
  flowName: string,
): Promise<string> => {
  // TODO: Make flows searchable by name.
  const result = await gqlRequest<GetIntegrationFlowQuery>({
    document: GetIntegrationFlowDocument,
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
    document: DeleteIntegrationDocument,
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
    document: TestIntegrationFlowDocument,
    variables: { id: integrationFlowId },
  });

  const executionId = result.testIntegrationFlow?.testIntegrationFlowResult?.execution?.id;
  if (!executionId) {
    throw new Error("Failed to get execution ID from test integration flow result");
  }
  return { executionId };
};

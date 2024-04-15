import { gqlRequest, gql } from "../../graphql.js";

interface Integration {
  flows: {
    nodes: {
      id: string;
      name: string;
    }[];
  };
}

/** Return Flow ID of given flow name on specified Integration. */
export const getIntegrationFlow = async (
  integrationId: string,
  flowName: string,
): Promise<string> => {
  // TODO: Make flows searchable by name.
  const result = await gqlRequest({
    document: gql`
      query flowId($integrationID: ID!) {
        integration(id: $id) {
          flows {
            nodes {
              id
              name
            }
          }
        }
      }
    `,
    variables: { integrationID: integrationId },
  });

  const integration: Integration = result.integration;
  const flows = integration.flows.nodes
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
    document: gql`
      mutation deleteIntegration($id: ID!) {
        deleteIntegration(input: { id: $id }) {
          errors {
            field
            messages
          }
        }
      }
    `,
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

  const result = await gqlRequest({
    document: gql`
      mutation testIntegrationFlow($id: ID!) {
        testIntegrationFlow(input: { id: $id }) {
          testIntegrationFlowResult {
            execution {
              id
            }
          }
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: { id: integrationFlowId },
  });

  const executionId: string = result.testIntegrationFlow.testIntegrationFlowResult.execution.id;
  return { executionId };
};

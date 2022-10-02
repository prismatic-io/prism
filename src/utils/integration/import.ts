import { gqlRequest, gql } from "../../graphql";

interface ImportDefinitionResult {
  integrationId: string;
  flows: { id: string; name: string }[];
  pendingAuthorizations: { id: string; url: string }[];
}

interface Integration {
  id: string;
  flows: {
    nodes: {
      id: string;
      name: string;
    }[];
  };
  testConfigVariables: {
    nodes: {
      id: string;
      authorizeUrl: string;
    }[];
  };
}

export const importDefinition = async (
  definition: string,
  integrationId?: string
): Promise<ImportDefinitionResult> => {
  const result = await gqlRequest({
    document: gql`
      mutation importIntegration($definition: String!, $integrationId: ID) {
        importIntegration(
          input: { definition: $definition, integrationId: $integrationId }
        ) {
          integration {
            id
            flows {
              nodes {
                id
                name
              }
            }
            testConfigVariables(status: "pending") {
              nodes {
                id
                authorizeUrl
              }
            }
          }
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: {
      definition,
      integrationId,
    },
  });

  const integration: Integration = result.importIntegration.integration;
  return {
    integrationId: integration.id,
    flows: integration.flows.nodes,
    pendingAuthorizations: integration.testConfigVariables.nodes.map(
      ({ id, authorizeUrl: url }) => ({ id, url })
    ),
  };
};

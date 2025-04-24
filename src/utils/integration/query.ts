import { gqlRequest, gql } from "../../graphql.js";

interface IntegrationByNameResult {
  id: string;
}

export const integrationByName = async (
  name: string,
): Promise<IntegrationByNameResult | undefined> => {
  const result = await gqlRequest({
    document: gql`
      query integration($name: String!) {
        integrations(name: $name) {
          nodes {
            id
          }
        }
      }
    `,
    variables: { name },
  });
  const [integration, ...rest]: { id: string }[] = result.integrations.nodes;
  if (rest.length !== 0) {
    throw new Error(`Found more than one Integration with name: ${name}`);
  }
  return integration;
};

export const isIntegrationConfigured = async (integrationId: string): Promise<boolean> => {
  const result = await gqlRequest({
    document: gql`
      query getIntegrationConfigurationState($integrationId: ID!) {
        integration(id: $integrationId) {
          systemInstance {
            configState
          }
        }
      }
    `,
    variables: {
      integrationId,
    },
  });

  return result.integration.systemInstance.configState !== "NEEDS_INSTANCE_CONFIGURATION";
};

export const pollForActiveConfigVarState = async (
  integrationId: string,
  configVarId: string,
): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await gqlRequest({
          document: gql`
            query state($integrationId: ID!) {
              integration(id: $integrationId) {
                testConfigVariables(status_In: ["pending", "active", "error"]) {
                  nodes {
                    id
                    status
                  }
                }
              }
            }
          `,
          variables: { integrationId },
        });

        const testConfigVariables: { id: string; status: string }[] =
          result.integration.testConfigVariables.nodes;

        const [{ status: serverStatus }] = testConfigVariables.filter(
          ({ id }) => id === configVarId,
        );

        const status = serverStatus.toLowerCase();
        if (status !== "pending") {
          clearInterval(interval);
          resolve(status === "active");
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000);
  });
};

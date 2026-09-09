import { GetIntegrationSystemInstanceDocument as GET_INTEGRATION_SYSTEM_INSTANCE } from "../../graphql/integrations/getIntegrationSystemInstance.generated.js";
import { Integration3Document as INTEGRATION3 } from "../../graphql/operations/integration3.generated.js";
import { StateDocument as STATE } from "../../graphql/operations/state.generated.js";
import { gqlRequest } from "../../graphql.js";

interface IntegrationByNameResult {
  id: string;
}

export const integrationByName = async (
  name: string,
): Promise<IntegrationByNameResult | undefined> => {
  const result = await gqlRequest({
    document: INTEGRATION3,
    variables: { name },
  });
  const [integration, ...rest]: { id: string }[] = result.integrations.nodes;
  if (rest.length !== 0) {
    throw new Error(`Found more than one Integration with name: ${name}`);
  }
  return integration;
};

export const getIntegrationSystemInstance = async (
  integrationId: string,
): Promise<{ isCodeNative?: boolean; isConfigured: boolean; systemInstanceId?: string }> => {
  const result = await gqlRequest({
    document: GET_INTEGRATION_SYSTEM_INSTANCE,
    variables: {
      integrationId,
    },
  });

  return {
    isCodeNative: result.integration?.isCodeNative,
    isConfigured: result.integration?.systemInstance.configState !== "NEEDS_INSTANCE_CONFIGURATION",
    systemInstanceId: result.integration?.systemInstance.id,
  };
};

export const pollForActiveConfigVarState = async (
  integrationId: string,
  configVarId: string,
): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await gqlRequest({
          document: STATE,
          variables: { integrationId },
        });

        const testConfigVariables = result.integration?.testConfigVariables.nodes ?? [];

        const [{ status: serverStatus } = { status: null }] = testConfigVariables.filter(
          ({ id }) => id === configVarId,
        );

        const status = serverStatus?.toLowerCase();
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

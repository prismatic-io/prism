import { gqlRequest, gql } from "../../graphql.js";

export const setGlobalDebugOnSystemInstance = async (
  integrationId: string,
  globalDebug: boolean,
): Promise<void> => {
  const systemInstanceResult = await gqlRequest({
    document: gql`
      query getSystemInstanceId($integrationId: ID!) {
        integration(id: $integrationId) {
          systemInstance {
            id
          }
        }
      }
    `,
    variables: {
      integrationId,
    },
  });

  const instanceId = systemInstanceResult.integration.systemInstance.id;

  await gqlRequest({
    document: gql`
      mutation updateInstanceGlobalDebug($instanceId: ID!, $globalDebug: Boolean!) {
        updateInstance(input: { id: $instanceId, globalDebug: $globalDebug }) {
          instance {
            id
          }
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: {
      instanceId,
      globalDebug,
    },
  });
};

import { GetSystemInstanceIdDocument as GET_SYSTEM_INSTANCE_ID } from "../../graphql/operations/getSystemInstanceId.generated.js";
import { UpdateInstanceGlobalDebugDocument as UPDATE_INSTANCE_GLOBAL_DEBUG } from "../../graphql/operations/updateInstanceGlobalDebug.generated.js";
import { gqlRequest } from "../../graphql.js";

export const setGlobalDebugOnSystemInstance = async (
  integrationId: string,
  globalDebug: boolean,
): Promise<void> => {
  const systemInstanceResult = await gqlRequest({
    document: GET_SYSTEM_INSTANCE_ID,
    variables: {
      integrationId,
    },
  });

  const instanceId = systemInstanceResult.integration?.systemInstance.id;
  if (!instanceId) throw new Error(`Integration not found: ${integrationId}`);

  await gqlRequest({
    document: UPDATE_INSTANCE_GLOBAL_DEBUG,
    variables: {
      instanceId,
      globalDebug,
    },
  });
};

import { commandOutput, defineCommand, argsSchema } from "../../command.js";
import { DisableInstanceDocument as DISABLE_INSTANCE } from "../../graphql/operations/disableInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("instanceId"),
  description: "Disable an Instance",
  args: argsSchema(
    z.object({
      instance: z.string().describe("ID of an instance"),
    }),
  ),
  async run(context) {
    const {
      args: { instance },
    } = context;

    const result: ResultOf<typeof DISABLE_INSTANCE> = await gqlRequest({
      document: DISABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    return resourceOutput(
      context,
      "instanceId",
      result.updateInstance?.instance?.id ?? commandOutput.error("Instance was not disabled"),
    );
  },
});

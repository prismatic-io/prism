import { DisableInstanceDocument as DISABLE_INSTANCE } from "../../graphql/operations/disableInstance.generated.js";
import { gqlRequest, requireOperationResult } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli } from "incur";
export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description: "Disable an Instance",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  async run(context) {
    const {
      args: { instance },
    } = context;

    const result = await gqlRequest({
      document: DISABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    const resourceId = requireOperationResult(
      result.updateInstance?.instance?.id,
      "Instance was not disabled",
    );
    return context.ok(
      { instanceId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "instances flow-configs list",
              description: "Inspect this instance's flows",
              args: { instance: resourceId },
            },
          ],
        },
      },
    );
  },
});

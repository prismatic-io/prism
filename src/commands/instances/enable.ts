import { EnableInstanceDocument as ENABLE_INSTANCE } from "../../graphql/operations/enableInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description: "Enable an Instance",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  async run(context) {
    const {
      args: { instance },
    } = context;

    const result = await gqlRequest({
      document: ENABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    const resourceId = result.updateInstance?.instance?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Instance was not enabled",
        exitCode: 2,
      });
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

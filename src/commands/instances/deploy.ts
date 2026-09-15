import { DeployInstanceDocument as DEPLOY_INSTANCE } from "../../graphql/operations/deployInstance.generated.js";
import { gqlRequest, requireOperationResult } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli } from "incur";
export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description: "Deploy an Instance",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  options: z.object({
    force: z
      .boolean()
      .optional()
      .describe(
        "Force deployment even when there are certain conditions that would normally prevent it",
      ),
  }),
  async run(context) {
    const {
      args: { instance },
      options: { force },
    } = context;

    const result = await gqlRequest({
      document: DEPLOY_INSTANCE,
      variables: {
        id: instance,
        force,
      },
    });

    const resourceId = requireOperationResult(
      result.deployInstance?.instance?.id,
      "Instance was not deployed",
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
  alias: { force: "f" },
});

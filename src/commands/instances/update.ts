import { DeployInstance2Document as DEPLOY_INSTANCE2 } from "../../graphql/operations/deployInstance2.generated.js";
import { UpdateInstanceDocument as UPDATE_INSTANCE } from "../../graphql/operations/updateInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description: "Update an Instance",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  options: z.object({
    name: z.string().optional().describe("Name of the instance"),
    description: z.string().optional().describe("Description for the instance"),
    version: z.string().optional().describe("ID of integration version"),
    deploy: z.boolean().optional().describe("Deploy the instance after updating"),
    label: z
      .array(z.string())
      .optional()
      .describe("a label or set of labels to apply to the instance"),
  }),
  async run(context) {
    const {
      args: { instance },
      options: { name, description, version, deploy, label },
    } = context;

    const result = await gqlRequest({
      document: UPDATE_INSTANCE,
      variables: {
        id: instance,
        name,
        description,
        version,
        labels: label,
      },
    });

    if (!deploy) {
      const resourceId = result.updateInstance?.instance?.id;
      if (resourceId == null)
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          message: "Instance was not updated",
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
    }

    const deployResult = await gqlRequest({
      document: DEPLOY_INSTANCE2,
      variables: {
        id: instance,
      },
    });

    const resourceId = deployResult.deployInstance?.instance?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Instance was not deployed",
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
  alias: { label: "l", version: "v", description: "d", name: "n" },
});

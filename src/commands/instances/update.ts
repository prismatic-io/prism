import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { DeployInstance2Document as DEPLOY_INSTANCE2 } from "../../graphql/operations/deployInstance2.generated.js";
import { UpdateInstanceDocument as UPDATE_INSTANCE } from "../../graphql/operations/updateInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("instanceId"),
  description: "Update an Instance",
  args: argsSchema(
    z.object({
      instance: z.string().describe("ID of an instance"),
    }),
  ),
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("Name of the instance")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .optional()
        .describe("Description for the instance")
        .meta({ cli: { char: "d" } }),
      version: z
        .string()
        .optional()
        .describe("ID of integration version")
        .meta({ cli: { char: "v" } }),
      deploy: z.boolean().optional().describe("Deploy the instance after updating"),
      label: z
        .array(z.string())
        .optional()
        .describe("a label or set of labels to apply to the instance")
        .meta({ cli: { char: "l" } }),
    }),
  ),
  async run(context) {
    const {
      args: { instance },
      options: { name, description, version, deploy, label },
    } = context;

    const result: ResultOf<typeof UPDATE_INSTANCE> = await gqlRequest({
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
      return resourceOutput(
        context,
        "instanceId",
        result.updateInstance?.instance?.id ?? commandOutput.error("Instance was not updated"),
      );
    }

    const deployResult = await gqlRequest({
      document: DEPLOY_INSTANCE2,
      variables: {
        id: instance,
      },
    });

    return resourceOutput(
      context,
      "instanceId",
      deployResult.deployInstance?.instance?.id ?? commandOutput.error("Instance was not deployed"),
    );
  },
});

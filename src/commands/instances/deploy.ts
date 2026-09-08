import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { DeployInstanceDocument as DEPLOY_INSTANCE } from "../../graphql/operations/deployInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("instanceId"),
  description: "Deploy an Instance",
  args: argsSchema(
    z.object({
      instance: z.string().describe("ID of an instance"),
    }),
  ),
  options: optionsSchema(
    z.object({
      force: z
        .boolean()
        .optional()
        .describe(
          "Force deployment even when there are certain conditions that would normally prevent it",
        )
        .meta({ cli: { char: "f" } }),
    }),
  ),
  async run(context) {
    const {
      args: { instance },
      options: { force },
    } = context;

    const result: ResultOf<typeof DEPLOY_INSTANCE> = await gqlRequest({
      document: DEPLOY_INSTANCE,
      variables: {
        id: instance,
        force,
      },
    });

    return resourceOutput(
      context,
      "instanceId",
      result.deployInstance?.instance?.id ?? commandOutput.error("Instance was not deployed"),
    );
  },
});

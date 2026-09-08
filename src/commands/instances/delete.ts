import { z } from "incur";
import { defineCommand, argsSchema } from "../../command.js";
import { DeleteInstanceDocument as DELETE_INSTANCE } from "../../graphql/operations/deleteInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("instanceId").extend({ deleted: z.literal(true) }),
  description: "Delete an Instance",
  args: argsSchema(
    z.object({
      instance: z.string().describe("ID of the instance to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { instance },
    } = context;

    await gqlRequest({
      document: DELETE_INSTANCE,
      variables: {
        id: instance,
      },
    });
    return resultOutput(context, { instanceId: instance, deleted: true });
  },
});

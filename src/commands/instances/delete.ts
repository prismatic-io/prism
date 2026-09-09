import { z, Cli } from "incur";
import { DeleteInstanceDocument as DELETE_INSTANCE } from "../../graphql/operations/deleteInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z
    .object({ instanceId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Instance",
  args: z.object({
    instance: z.string().describe("ID of the instance to delete"),
  }),
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
    return { instanceId: instance, deleted: true as const };
  },
});

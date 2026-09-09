import { z, Cli } from "incur";
import { DeleteOnPremiseResourceDocument as DELETE_ON_PREMISE_RESOURCE } from "../../graphql/operations/deleteOnPremiseResource.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z
    .object({ resourceId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an On-Premise Resource",
  args: z.object({
    resource: z.string().describe("ID of the On-Premise Resource to delete"),
  }),
  async run(context) {
    const {
      args: { resource },
    } = context;

    await gqlRequest({
      document: DELETE_ON_PREMISE_RESOURCE,
      variables: {
        id: resource,
      },
    });
    return { resourceId: resource, deleted: true as const };
  },
});

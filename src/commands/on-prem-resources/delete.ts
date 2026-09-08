import { z } from "incur";
import { defineCommand, argsSchema } from "../../command.js";
import { DeleteOnPremiseResourceDocument as DELETE_ON_PREMISE_RESOURCE } from "../../graphql/operations/deleteOnPremiseResource.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("resourceId").extend({ deleted: z.literal(true) }),
  description: "Delete an On-Premise Resource",
  args: argsSchema(
    z.object({
      resource: z.string().describe("ID of the On-Premise Resource to delete"),
    }),
  ),
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
    return resultOutput(context, { resourceId: resource, deleted: true });
  },
});

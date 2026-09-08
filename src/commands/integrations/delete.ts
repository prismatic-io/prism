import { z } from "incur";
import { defineCommand, argsSchema } from "../../command.js";
import { DeleteIntegrationDocument as DELETE_INTEGRATION } from "../../graphql/operations/deleteIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId").extend({ deleted: z.literal(true) }),
  description: "Delete an Integration",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of the integration to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
    } = context;

    await gqlRequest({
      document: DELETE_INTEGRATION,
      variables: {
        id: integration,
      },
    });
    return resultOutput(context, { integrationId: integration, deleted: true });
  },
});

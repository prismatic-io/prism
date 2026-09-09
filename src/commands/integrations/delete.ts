import { z, Cli } from "incur";
import { DeleteIntegrationDocument as DELETE_INTEGRATION } from "../../graphql/operations/deleteIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z
    .object({ integrationId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Integration",
  args: z.object({
    integration: z.string().describe("ID of the integration to delete"),
  }),
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
    return { integrationId: integration, deleted: true as const };
  },
});

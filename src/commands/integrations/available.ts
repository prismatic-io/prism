import { MarkAvailabilityDocument as MARK_AVAILABILITY } from "../../graphql/operations/markAvailability.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Mark an Integration version as available or unavailable",
  args: z.object({
    integration: z.string().describe("ID of an integration version"),
  }),
  options: z.object({
    available: z.boolean().describe("Version is available or unavailable"),
  }),
  async run(context) {
    const {
      args: { integration },
      options: { available },
    } = context;

    const result = await gqlRequest({
      document: MARK_AVAILABILITY,
      variables: {
        id: integration,
        available,
      },
    });

    const resourceId = result.updateIntegrationVersionAvailability?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration availability was not updated",
        exitCode: 2,
      });
    return context.ok(
      { integrationId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "integrations flows list",
              description: "Inspect this integration's flows",
              args: { integration: resourceId },
            },
          ],
        },
      },
    );
  },
  alias: { available: "a" },
});

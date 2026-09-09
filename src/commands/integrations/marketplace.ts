import { UpdateMarketplaceConfigurationDocument as UPDATE_MARKETPLACE_CONFIGURATION } from "../../graphql/operations/updateMarketplaceConfiguration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Make a version of an Integration available in the Marketplace",
  args: z.object({
    integration: z.string().describe("ID of an integration version to make marketplace available"),
  }),
  options: z.object({
    available: z.boolean().describe("Mark this Integration version available in the marketplace"),
    deployable: z
      .boolean()
      .default(true)
      .describe(
        "Mark this Integration version as deployable in the marketplace; does not apply if not also marked available",
      ),
    "allow-multiple-instances": z
      .boolean()
      .optional()
      .describe("Allow a customer to deploy multiple instances of this integration"),
    overview: z.string().optional().describe("Overview to describe the purpose of the integration"),
  }),
  async run(context) {
    const {
      args: { integration },
      options: { available, deployable, overview, "allow-multiple-instances": multipleInstances },
    } = context;

    const marketplaceConfiguration = available
      ? deployable
        ? "AVAILABLE_AND_DEPLOYABLE"
        : "AVAILABLE_NOT_DEPLOYABLE"
      : "NOT_AVAILABLE_IN_MARKETPLACE";

    const result = await gqlRequest({
      document: UPDATE_MARKETPLACE_CONFIGURATION,
      variables: {
        id: integration,
        marketplaceConfiguration,
        // The overview flag is optional; the mutation requires a non-null
        // String, so send an empty string when it is omitted.
        overview: overview ?? "",
        multipleInstances,
      },
    });

    const resourceId = result.updateIntegrationMarketplaceConfiguration?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration marketplace configuration was not updated",
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
  alias: { overview: "o", "allow-multiple-instances": "m", deployable: "d", available: "a" },
});

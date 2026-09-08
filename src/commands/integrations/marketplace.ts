import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { UpdateMarketplaceConfigurationDocument as UPDATE_MARKETPLACE_CONFIGURATION } from "../../graphql/operations/updateMarketplaceConfiguration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Make a version of an Integration available in the Marketplace",
  args: argsSchema(
    z.object({
      integration: z
        .string()
        .describe("ID of an integration version to make marketplace available"),
    }),
  ),
  options: optionsSchema(
    z.object({
      available: z
        .boolean()
        .describe("Mark this Integration version available in the marketplace")
        .meta({ cli: { char: "a", allowNo: true } }),
      deployable: z
        .boolean()
        .default(true)
        .describe(
          "Mark this Integration version as deployable in the marketplace; does not apply if not also marked available",
        )
        .meta({ cli: { char: "d", allowNo: true } }),
      "allow-multiple-instances": z
        .boolean()
        .optional()
        .describe("Allow a customer to deploy multiple instances of this integration")
        .meta({ cli: { char: "m", allowNo: true } }),
      overview: z
        .string()
        .optional()
        .describe("Overview to describe the purpose of the integration")
        .meta({ cli: { char: "o" } }),
    }),
  ),
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

    const result: ResultOf<typeof UPDATE_MARKETPLACE_CONFIGURATION> = await gqlRequest({
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

    return resourceOutput(
      context,
      "integrationId",
      result.updateIntegrationMarketplaceConfiguration?.integration?.id ??
        commandOutput.error("Integration marketplace configuration was not updated"),
    );
  },
});

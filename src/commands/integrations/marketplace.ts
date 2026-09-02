import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Make a version of an Integration available in the Marketplace",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of an integration version to make marketplace available",
    }),
  },
  options: {
    available: option.boolean({
      char: "a",
      description: "Mark this Integration version available in the marketplace",
      allowNo: true,
      required: true,
    }),
    deployable: option.boolean({
      char: "d",
      description:
        "Mark this Integration version as deployable in the marketplace; does not apply if not also marked available",
      allowNo: true,
      default: true,
    }),
    "allow-multiple-instances": option.boolean({
      char: "m",
      description: "Allow a customer to deploy multiple instances of this integration",
      allowNo: true,
    }),
    overview: option.string({
      char: "o",
      description: "Overview to describe the purpose of the integration",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { available, deployable, overview, "allow-multiple-instances": multipleInstances },
    } = commandInput();

    const marketplaceConfiguration = available
      ? deployable
        ? "AVAILABLE_AND_DEPLOYABLE"
        : "AVAILABLE_NOT_DEPLOYABLE"
      : "NOT_AVAILABLE_IN_MARKETPLACE";

    const result = await gqlRequest({
      document: gql`
        mutation updateMarketplaceConfiguration(
          $id: ID
          $marketplaceConfiguration: String!
          $overview: String!
          $multipleInstances: Boolean
        ) {
          updateIntegrationMarketplaceConfiguration(
            input: {
              id: $id
              marketplaceConfiguration: $marketplaceConfiguration
              overview: $overview
              allowMultipleMarketplaceInstances: $multipleInstances
            }
          ) {
            integration {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: integration,
        marketplaceConfiguration,
        // The overview flag is optional; the mutation requires a non-null
        // String, so send an empty string when it is omitted.
        overview: overview ?? "",
        multipleInstances,
      },
    });

    commandOutput.log(result.updateIntegrationMarketplaceConfiguration.integration.id);
  },
});

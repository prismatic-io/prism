import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class MarketplaceCommand extends Command {
  static description =
    "Make a version of an Integration available in the Marketplace";

  static args = [
    {
      name: "integration",
      required: true,
      description: "ID of an integration version to make marketplace available",
    },
  ];

  static flags = {
    available: Flags.boolean({
      char: "a",
      description: "Mark this Integration version available in the marketplace",
      allowNo: true,
      required: true,
    }),
    deployable: Flags.boolean({
      char: "d",
      description:
        "Mark this Integration version as deployable in the marketplace; does not apply if not also marked available",
      allowNo: true,
      default: true,
    }),
    overview: Flags.string({
      char: "o",
      required: true,
      description: "Overview to describe the purpose of the integration",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { available, deployable, overview },
    } = await this.parse(MarketplaceCommand);

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
        ) {
          updateIntegrationMarketplaceConfiguration(
            input: {
              id: $id
              marketplaceConfiguration: $marketplaceConfiguration
              overview: $overview
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
        overview,
      },
    });

    this.log(result.updateIntegrationMarketplaceConfiguration.integration.id);
  }
}
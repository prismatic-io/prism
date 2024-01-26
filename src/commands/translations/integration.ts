import { Command, Args } from "@oclif/core";
import { gqlRequest } from "../../graphql";
import { MarketplaceTranslations } from "../../types";
import { processIntegrationsForTranslations } from "../../utils/translations/processDataForTranslations";
import { GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS } from "../../queries.graphql";

export default class TranslationsCommand extends Command {
  static description = "Generate Dynamic Phrases for a Particular Integration";

  static args = {
    integration: Args.string({
      required: true,
      description: "ID of the integration to generate phrases for",
    }),
  };

  async run() {
    const {
      args: { integration },
    } = await this.parse(TranslationsCommand);

    this.log("Fetching marketplace integrations");
    const result = await gqlRequest<MarketplaceTranslations>({
      document: GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS,
      variables: {
        id: integration,
      },
    });

    this.log("Processing marketplace integration");
    const processedIntegations = processIntegrationsForTranslations(result);

    this.logJson(processedIntegations);
  }
}

import { Command } from "@oclif/core";
import { gqlRequest } from "../../graphql";
import { MarketplaceTranslations } from "../../types";
import { processIntegrationsForTranslations } from "../../utils/translations/processDataForTranslations";
import { GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS } from "../../queries.graphql";

export default class TranslationsCommand extends Command {
  static description = "Generate Dynamic Phrases for Embedded Marketplace";

  async run() {
    const result = await gqlRequest<MarketplaceTranslations>({
      document: GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS,
    });

    const processedIntegations = processIntegrationsForTranslations(result);

    this.logJson(processedIntegations);
  }
}

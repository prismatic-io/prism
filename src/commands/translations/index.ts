import { Command } from "@oclif/core";
import { gqlRequest } from "../../graphql";
import { MarketplaceTranslations } from "../../types";
import processIntegration from "../../utils/translations/processDataForTranslations";
import { GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS } from "../../queries.graphql";

export default class TranslationsCommand extends Command {
  static description = "Generate Dynamic Phrases for Embedded Marketplace";

  async run() {
    this.log("Fetching marketplace integrations");
    const result = await gqlRequest<MarketplaceTranslations>({
      document: GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS,
    });

    this.log("Processing marketplace integrations");
    const data = processIntegration(result);
  }
}

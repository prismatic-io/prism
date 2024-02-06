import { Command, Flags } from "@oclif/core";

import { gqlRequest } from "../../graphql";
import { MarketplaceTranslations } from "../../types";
import { processIntegrationsForTranslations } from "../../utils/translations/processDataForTranslations";
import { GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS } from "../../queries.graphql";
import { fs } from "../../fs";

export default class TranslationsCommand extends Command {
  static description = "Generate Dynamic Phrases for Embedded Marketplace";
  static flags = {
    "output-file": Flags.string({
      required: false,
      char: "o",
      description: "Output the results of the action to a specified file",
      default: "translations_output.json",
    }),
  };

  async run(): Promise<void> {
    const {
      flags: { "output-file": output },
    } = await this.parse(TranslationsCommand);

    const cwd = process.cwd();

    const result = await gqlRequest<MarketplaceTranslations>({
      document: GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS,
    });

    const processedIntegrations = processIntegrationsForTranslations(result);

    if (output) {
      process.chdir(cwd);
      this.log(`Writing translations to ${output}`);
      fs.writeFile(output, JSON.stringify(processedIntegrations, null, 2));
    } else {
      this.logJson(processedIntegrations);
    }
  }
}

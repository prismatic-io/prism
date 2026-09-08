import type { ResultOf } from "@graphql-typed-document-node/core";
import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { fs } from "../../fs.js";
import { gqlRequest } from "../../graphql.js";
import { MarketplaceTranslationsDocument as MARKETPLACE_TRANSLATIONS } from "../../graphql/translations/marketplaceTranslations.generated.js";
import { processIntegrationsForTranslations } from "../../utils/translations/processDataForTranslations.js";

export default class TranslationsCommand extends PrismaticBaseCommand {
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

    const result: ResultOf<typeof MARKETPLACE_TRANSLATIONS> = await gqlRequest({
      document: MARKETPLACE_TRANSLATIONS,
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

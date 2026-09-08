import { z } from "incur";
import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { fs } from "../../fs.js";
import { MarketplaceTranslationsDocument as MARKETPLACE_TRANSLATIONS } from "../../graphql/translations/marketplaceTranslations.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resultOutput, warningsOutput } from "../../output.js";
import { processIntegrationsForTranslations } from "../../utils/translations/processDataForTranslations.js";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: z.union([
    z.object({ path: z.string(), phraseCount: z.number().int(), ...warningsOutput }),
    z.object({ translations: z.record(z.string(), z.string()), ...warningsOutput }),
  ]),
  description: "Generate Dynamic Phrases for Embedded Marketplace",
  options: optionsSchema(
    z.object({
      "output-file": z
        .string()
        .default("translations_output.json")
        .describe("Output the results of the action to a specified file")
        .meta({ cli: { char: "o" } }),
    }),
  ),
  async run(context) {
    const {
      options: { "output-file": output },
    } = context;

    const result: ResultOf<typeof MARKETPLACE_TRANSLATIONS> = await gqlRequest({
      document: MARKETPLACE_TRANSLATIONS,
    });

    const processedIntegrations = processIntegrationsForTranslations(result);

    if (output) {
      commandOutput.log(`Writing translations to ${output}`);
      await fs.writeFile(output, JSON.stringify(processedIntegrations, null, 2));
      return resultOutput(context, {
        path: output,
        phraseCount: Object.keys(processedIntegrations).length,
      });
    } else {
      return resultOutput(context, { translations: processedIntegrations });
    }
  },
});

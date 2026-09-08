import { z } from "incur";
import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { ConvertToCniDocument as CONVERT_TO_CNI } from "../../../graphql/operations/ConvertToCNI.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resultOutput, warningsOutput } from "../../../output.js";
import { ux } from "../../../utils/ux.js";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: z.object({
    integrationId: z.string(),
    downloadUrl: z.string().nullable(),
    conversionErrors: z.array(
      z.object({ path: z.string().nullable(), error: z.string(), errorType: z.string() }),
    ),
    ...warningsOutput,
  }),
  description: "Convert a Low-Code Integration's YAML file into a Code Native Integration",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of the low-code integration to convert"),
    }),
  ),
  options: optionsSchema(
    z.object({
      registryPrefix: z
        .string()
        .optional()
        .describe("The registry prefix to use for the converted integration")
        .meta({ cli: { char: "r" } }),
      registryUrl: z
        .string()
        .optional()
        .describe("The registry URL to use for the converted integration")
        .meta({ cli: { char: "u" } }),
      includeComments: z
        .boolean()
        .default(false)
        .describe("Whether to include inline comments in the generated code")
        .meta({ cli: { char: "c" } }),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: { registryPrefix, registryUrl, includeComments },
    } = context;

    ux.action.start("Converting low-code integration to code-native integration");

    try {
      const result: ResultOf<typeof CONVERT_TO_CNI> = await gqlRequest({
        document: CONVERT_TO_CNI,
        variables: {
          id: integration,
          registryPrefix,
          registryUrl,
          includeComments,
        },
      });

      ux.action.stop();

      const conversionResult =
        result.convertLowCodeIntegration?.convertLowCodeIntegrationFormResult ??
        commandOutput.error("Integration conversion returned no result");
      const { url, conversionErrors } = conversionResult;

      if (conversionErrors && conversionErrors.length > 0) {
        commandOutput.warn("Conversion completed with warnings:");
        for (const error of conversionErrors.filter((value) => value !== null)) {
          commandOutput.warn(`  ${error.path}: ${error.error} (${error.errorType})`);
        }
      }

      commandOutput.log(`
Conversion completed successfully!

Download URL:\n${url}

Next steps:
  1. Download the zip file from the URL above
  2. Extract it to your desired location
  3. Run: npm install && npm update --save && npm run format

If installation issues occur during step 3, double check your package.json file and component registry set-up.
For documentation on code-native integrations, visit https://prismatic.io/docs/integrations/code-native/`);
      return resultOutput(context, {
        integrationId: integration,
        downloadUrl: url,
        conversionErrors: (conversionErrors ?? []).filter((value) => value !== null),
      });
    } catch (error) {
      ux.action.stop("failed");
      throw error;
    }
  },
});

import { z, Cli, Errors } from "incur";
import { writeCommandStatus, writeCommandOutput } from "../../../command.js";
import { ConvertToCniDocument as CONVERT_TO_CNI } from "../../../graphql/operations/ConvertToCNI.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { startAction, stopAction } from "../../../utils/progress.js";

export default Cli.command({
  output: z.object({
    integrationId: z.string(),
    downloadUrl: z.string().nullable(),
    conversionErrors: z.array(
      z.object({ path: z.string().nullable(), error: z.string(), errorType: z.string() }),
    ),
    ...warningsOutput,
  }),
  description: "Convert a Low-Code Integration's YAML file into a Code Native Integration",
  args: z.object({
    integration: z.string().describe("ID of the low-code integration to convert"),
  }),
  options: z.object({
    registryPrefix: z
      .string()
      .optional()
      .describe("The registry prefix to use for the converted integration"),
    registryUrl: z
      .string()
      .optional()
      .describe("The registry URL to use for the converted integration"),
    includeComments: z
      .boolean()
      .default(false)
      .describe("Whether to include inline comments in the generated code"),
  }),
  async run(context) {
    const {
      args: { integration },
      options: { registryPrefix, registryUrl, includeComments },
    } = context;

    startAction("Converting low-code integration to code-native integration");

    try {
      const result = await gqlRequest({
        document: CONVERT_TO_CNI,
        variables: {
          id: integration,
          registryPrefix,
          registryUrl,
          includeComments,
        },
      });

      stopAction();

      const conversionResult =
        result.convertLowCodeIntegration?.convertLowCodeIntegrationFormResult;
      if (conversionResult == null)
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          message: "Integration conversion returned no result",
          exitCode: 2,
        });
      const { url, conversionErrors } = conversionResult;

      if (conversionErrors && conversionErrors.length > 0) {
        writeCommandOutput("Conversion completed with warnings:", "stderr");
        for (const error of conversionErrors.filter((value) => value !== null)) {
          writeCommandOutput(`  ${error.path}: ${error.error} (${error.errorType})`, "stderr");
        }
      }

      writeCommandStatus(`
Conversion completed successfully!

Download URL:\n${url}

Next steps:
  1. Download the zip file from the URL above
  2. Extract it to your desired location
  3. Run: npm install && npm update --save && npm run format

If installation issues occur during step 3, double check your package.json file and component registry set-up.
For documentation on code-native integrations, visit https://prismatic.io/docs/integrations/code-native/`);
      return {
        integrationId: integration,
        downloadUrl: url,
        conversionErrors: (conversionErrors ?? []).filter((value) => value !== null),
      };
    } catch (error) {
      stopAction("failed");
      throw error;
    }
  },
  alias: { includeComments: "c", registryUrl: "u", registryPrefix: "r" },
});

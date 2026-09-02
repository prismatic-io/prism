import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

interface ConversionError {
  path: string;
  error: string;
  errorType: string;
}

interface ConvertLowCodeIntegrationResult {
  convertLowCodeIntegration: {
    convertLowCodeIntegrationFormResult: {
      url: string;
      conversionErrors: ConversionError[];
    };
    errors: {
      field: string;
      messages: string[];
    }[];
  };
}

export default defineCommand({
  description: "Convert a Low-Code Integration's YAML file into a Code Native Integration",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of the low-code integration to convert",
    }),
  },
  options: {
    registryPrefix: option.string({
      required: false,
      char: "r",
      description: "The registry prefix to use for the converted integration",
    }),
    registryUrl: option.string({
      required: false,
      char: "u",
      description: "The registry URL to use for the converted integration",
    }),
    includeComments: option.boolean({
      required: false,
      char: "c",
      description: "Whether to include inline comments in the generated code",
      default: false,
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { registryPrefix, registryUrl, includeComments },
    } = commandInput();

    ux.action.start("Converting low-code integration to code-native integration");

    try {
      const result = await gqlRequest<ConvertLowCodeIntegrationResult>({
        document: gql`
          mutation ConvertToCNI($id: ID!, $registryPrefix: String, $registryUrl: String, $includeComments: Boolean) {
            convertLowCodeIntegration(input: { id: $id, registryPrefix: $registryPrefix, registryUrl: $registryUrl, includeComments: $includeComments }) {
              convertLowCodeIntegrationFormResult {
                url
                conversionErrors {
                  path
                  error
                  errorType
                }
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
          registryPrefix,
          registryUrl,
          includeComments,
        },
      });

      ux.action.stop();

      const { url, conversionErrors } =
        result.convertLowCodeIntegration.convertLowCodeIntegrationFormResult;

      if (conversionErrors && conversionErrors.length > 0) {
        commandOutput.warn("Conversion completed with warnings:");
        for (const error of conversionErrors) {
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
    } catch (error) {
      ux.action.stop("failed");
      throw error;
    }
  },
});

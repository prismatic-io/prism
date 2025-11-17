import { Args, Config, Flags, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { toArgv } from "../../../generate/util.js";

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

export default class ConvertIntegrationCommand extends PrismaticBaseCommand {
  static description = "Convert a Low-Code Integration's YAML file into a Code Native Integration";
  static args = {
    integration: Args.string({
      required: true,
      description: "ID of the low-code integration to convert",
    }),
  };

  static flags = {
    registryPrefix: Flags.string({
      required: false,
      char: "r",
      description: "The registry prefix to use for the converted integration",
    }),
    registryUrl: Flags.string({
      required: false,
      char: "u",
      description: "The registry URL to use for the converted integration",
    }),
    includeComments: Flags.boolean({
      required: false,
      char: "c",
      description: "Whether to include inline comments in the generated code",
      default: false,
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { registryPrefix, registryUrl, includeComments },
    } = await this.parse(ConvertIntegrationCommand);

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
        this.warn("Conversion completed with warnings:");
        for (const error of conversionErrors) {
          this.warn(`  ${error.path}: ${error.error} (${error.errorType})`);
        }
      }

      this.log(`
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
  }

  static async invoke(args: { [K in keyof typeof this.flags]+?: unknown }, config: Config) {
    await ConvertIntegrationCommand.run(toArgv(args), config);
  }
}

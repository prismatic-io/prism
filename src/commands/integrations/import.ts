import { Cli, z } from "incur";
import { writeCommandOutput, writeCommandStatus } from "../../command.js";
import { CommandFailedError, ValidationError } from "../../errors.js";
import { exists } from "../../fs.js";
import { warningsOutput } from "../../output.js";
import { resolveWaitOptions, waitOptions } from "../../utils/availability.js";
import {
  compareConfigVars,
  extractYAMLFromPath,
  getIntegrationDefinition,
  importCodeNativeIntegration,
  importYamlIntegration,
  loadCodeNativeIntegrationEntryPoint,
} from "../../utils/integration/import.js";
import { openIntegration } from "../../utils/integration/open.js";
import { confirm as confirmPrompt } from "../../utils/prompts.js";

export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Import an Integration using a YAML definition file or a Code Native Integration",
  options: z.object({
    path: z
      .string()
      .optional()
      .describe(
        "If supplied, the path to the YAML definition of the integration to import. Not applicable for Code Native Integrations.",
      ),
    integrationId: z.string().optional().describe("The ID of the integration being imported"),
    "icon-path": z
      .string()
      .optional()
      .describe(
        "If supplied, the path to the PNG icon for the integration. Not applicable for Code Native Integrations.",
      ),
    open: z
      .boolean()
      .default(false)
      .describe("If supplied, open the Designer for the imported integration"),
    replace: z
      .boolean()
      .default(false)
      .describe(
        "If supplied, allows replacing an existing integration regardless of code-native status. Requires integrationId.",
      ),
    "test-api-key": z
      .array(z.string())
      .optional()
      .describe(
        'Provide test API keys for flows in the format flowName="API_KEY". Can be specified multiple times.',
      ),
    confirm: z
      .boolean()
      .default(true)
      .describe("Interactively confirm the import when using --replace"),
    wait: waitOptions.wait.describe(
      "Wait for the Code Native Integration package to become available before importing the definition (use --no-wait to import immediately)",
    ),
    "wait-timeout": waitOptions["wait-timeout"].describe(
      "Seconds to wait for the Code Native Integration package to become available",
    ),
  }),
  async run(context) {
    const {
      options: {
        path,
        integrationId,
        "icon-path": iconPath,
        open,
        replace,
        "test-api-key": testApiKey,
        confirm,
      },
    } = context;
    const wait = resolveWaitOptions(context.options);

    if (path && !(await exists(path))) {
      throw new ValidationError({
        message: `Cannot find definition file at specified path "${path}"`,
      });
    }
    if (iconPath && !(await exists(iconPath))) {
      throw new ValidationError({
        message: `Cannot find icon file at specified path "${iconPath}"`,
      });
    }
    if (replace && !integrationId) {
      throw new ValidationError({
        message: "An integrationId is required when using the replace flag",
      });
    }

    if (replace && integrationId) {
      const existingYAML = await getIntegrationDefinition(integrationId);
      const nextYAML = path
        ? await extractYAMLFromPath(path)
        : (await loadCodeNativeIntegrationEntryPoint()).integrationDefinition;
      const missingVars = await compareConfigVars(existingYAML, nextYAML);

      if (missingVars.length > 0) {
        writeCommandOutput(
          `The integration you are attempting to replace defines required config variables that are not present in the integration you are importing: ${missingVars.join(
            ", ",
          )}`,
          "stderr",
        );

        if (confirm) {
          const shouldContinue = await confirmPrompt("Continue? (yes/no)");
          if (!shouldContinue) {
            throw new CommandFailedError({
              message: "Import canceled",
            });
          }
        }
      }
    }

    if (replace) {
      writeCommandOutput(
        `You are attempting to replace an existing integration with ${
          path ? `the YAML defined at ${path}` : "the current integration you are building"
        }. By proceeding, the draft version of the existing integration will be replaced by this new version.

There will be no way to restore the existing draft. If you wish to save it, either publish it or export its YAML before proceeding.`,
        "stderr",
      );

      if (confirm) {
        const shouldContinue = await confirmPrompt("Continue? (yes/no)");
        if (!shouldContinue) {
          throw new CommandFailedError({
            message: "Import canceled",
          });
        }
      }
    }

    const integrationImportId = path
      ? // A path was specified, so assume we're importing a YAML Integration.
        await importYamlIntegration(path, integrationId, iconPath, replace)
      : // No path was specified, so assume the current directory is a Code Native Integration and import it.
        await importCodeNativeIntegration(integrationId, replace, testApiKey, wait);

    writeCommandStatus(integrationImportId);

    if (open) {
      await openIntegration(integrationImportId);
    }
    return context.ok(
      { integrationId: integrationImportId },
      {
        cta: {
          commands: [
            {
              command: "integrations flows list",
              description: "Inspect the imported integration",
              args: { integration: integrationImportId },
            },
          ],
        },
      },
    );
  },
  alias: { replace: "r", open: "o", integrationId: "i", path: "p" },
});

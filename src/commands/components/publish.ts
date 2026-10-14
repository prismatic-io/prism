import { resolve } from "node:path";
import { Cli, z } from "incur";
import { writeCommandStatus } from "../../command.js";
import { getWorkingDirectory, withWorkingDirectory } from "../../command-context.js";
import { warningsOutput } from "../../output.js";
import {
  publishWaitDescription,
  resolveWaitOptions,
  waitForComponentVersion,
  waitOptions,
  waitTimeout,
} from "../../utils/availability.js";
import {
  createComponentPackage,
  createSourceCodePackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";
import {
  checkPackageSignature,
  confirmPublish,
  publishDefinition,
  uploadConnectionIcons,
  uploadFile,
} from "../../utils/component/publish.js";
import { getPackageEntrypointDirectory } from "../../utils/import.js";
import { startAction, stopAction } from "../../utils/progress.js";
import { confirm as confirmPrompt } from "../../utils/prompts.js";
import { whoAmI } from "../../utils/user/query.js";

export default Cli.command({
  output: z.union([
    z.object({
      ...warningsOutput,
      componentId: z.string(),
      label: z.string(),
      versionNumber: z.number(),
      available: z.boolean(),
    }),
    z.object({ success: z.literal(true), messages: z.array(z.string()), ...warningsOutput }),
  ]),
  description: "Publish a Component to Prismatic",
  examples: [{ description: "Publish a component after building it with npm run build:" }],
  options: z.object({
    comment: z.string().optional().describe("Comment about changes in this Publish"),
    "check-signature": z
      .boolean()
      .default(true)
      .describe("Check signature of existing component and confirm publish if matched"),
    "skip-on-signature-match": z
      .boolean()
      .optional()
      .describe("Skips component publish if the new signature matches the existing signature"),
    customer: z
      .string()
      .optional()
      .describe("ID of customer with which to associate the component"),
    commitHash: z
      .string()
      .optional()
      .describe("Commit hash corresponding to the component version being published"),
    commitUrl: z
      .string()
      .optional()
      .describe("URL to the commit details for this component version"),
    repoUrl: z
      .string()
      .optional()
      .describe("URL to the repository containing the component definition"),
    pullRequestUrl: z
      .string()
      .optional()
      .describe("URL to the pull request that modified this component version"),
    "include-source": z
      .boolean()
      .default(false)
      .describe("Include source code in the component publish"),
    ...waitOptions(publishWaitDescription),
  }),
  async run(context) {
    const {
      options: {
        comment,
        "check-signature": checkSignature,
        "skip-on-signature-match": skipOnSignatureMatch,
        customer: flagCustomer,
        commitHash,
        commitUrl,
        repoUrl,
        pullRequestUrl,
        "include-source": includeSource,
      },
    } = context;
    const wait = resolveWaitOptions(context.options);

    const me = await whoAmI();
    const customer = flagCustomer ?? me.customer?.id;

    const didProvideAttributes =
      Boolean(commitHash) || Boolean(repoUrl) || Boolean(pullRequestUrl) || Boolean(commitUrl);
    const attributes = {
      commitHash,
      commitUrl,
      repoUrl,
      pullRequestUrl,
    };

    return withWorkingDirectory(await getPackageEntrypointDirectory("component"), async () => {
      const loadedDefinition = await loadEntrypoint();
      const definition = { ...loadedDefinition, display: { ...loadedDefinition.display } };
      await validateDefinition(definition);

      const packagePath = await createComponentPackage();

      // Optionally create a source code package if the --include-source flag is set
      let sourceCodePath: string | undefined;
      if (includeSource) {
        sourceCodePath = await createSourceCodePackage();
      }

      if (checkSignature) {
        const signatureMatches = await checkPackageSignature(definition, packagePath);
        if (signatureMatches) {
          if (
            skipOnSignatureMatch ||
            !(await confirmPrompt(
              "The new package signature matches the existing package signature. Continue publishing new package? (y/N)",
            ))
          ) {
            // Signatures match and we've opted to skip on match, so bail.
            writeCommandStatus("Package signatures match, skipping publish.");
            return {
              success: true as const,
              messages: ["Package signatures match, skipping publish."],
            };
          }
        }
      }

      const shouldPublish = await confirmPublish(definition);
      if (!shouldPublish) {
        return { success: true as const, messages: ["Publishing cancelled."] };
      }

      const {
        componentId,
        iconUploadUrl,
        packageUploadUrl,
        sourceUploadUrl,
        connectionIconUploadUrls,
        versionNumber,
      } = await publishDefinition(definition, {
        comment,
        customer,
        attributes: didProvideAttributes ? attributes : undefined,
      });

      const {
        display: { iconPath },
      } = definition;
      await uploadFile(packagePath, packageUploadUrl);
      if (iconPath) {
        await uploadFile(resolve(getWorkingDirectory(), iconPath), iconUploadUrl);
      }

      // Upload source code if it was created and the API returned an upload URL
      if (sourceCodePath && sourceUploadUrl) {
        await uploadFile(sourceCodePath, sourceUploadUrl);
      }

      await uploadConnectionIcons(definition, connectionIconUploadUrls);

      const {
        key,
        display: { label },
      } = definition;
      const cta = {
        commands: [
          {
            command: "components list",
            description: "Check whether the new version has finished processing",
            options: { search: key },
          },
        ],
      };

      if (!wait) {
        writeCommandStatus(
          `Successfully submitted ${label} (v${versionNumber})! The publish should finish processing shortly.`,
        );
        return context.ok({ componentId, label, versionNumber, available: false }, { cta });
      }

      startAction(`Waiting for ${label} (v${versionNumber}) to become available`);
      const available = await waitForComponentVersion(componentId, wait);
      if (!available) {
        stopAction("timed out");
        return context.error({
          ...waitTimeout(
            `${label} (v${versionNumber}) was published and is still processing after ${wait.timeoutSeconds} seconds.`,
          ),
          cta,
        });
      }
      stopAction();
      writeCommandStatus(`Successfully published ${label} (v${versionNumber})!`);
      return context.ok({ componentId, label, versionNumber, available: true }, { cta });
    });
  },
  alias: { comment: "c" },
});

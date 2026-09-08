import { resolve } from "node:path";
import { getPackageEntrypointDirectory } from "../../utils/import.js";
import { z } from "incur";
import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { resultOutput, warningsOutput } from "../../output.js";
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
import { whoAmI } from "../../utils/user/query.js";
import { ux } from "../../utils/ux.js";

export default defineCommand({
  mutates: true,
  output: z.union([
    z.object({
      ...warningsOutput,
      submitted: z.literal(true),
      label: z.string(),
      versionNumber: z.number(),
    }),
    z.object({ success: z.literal(true), messages: z.array(z.string()), ...warningsOutput }),
  ]),
  description: "Publish a Component to Prismatic",
  examples: [{ description: "Build and publish a component:" }],
  options: optionsSchema(
    z.object({
      comment: z
        .string()
        .optional()
        .describe("Comment about changes in this Publish")
        .meta({ cli: { char: "c" } }),
      confirm: z
        .boolean()
        .default(true)
        .describe("Interactively confirm publish")
        .meta({ cli: { allowNo: true } }),
      "check-signature": z
        .boolean()
        .default(true)
        .describe("Check signature of existing component and confirm publish if matched")
        .meta({ cli: { allowNo: true } }),
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
    }),
  ),
  async run(context) {
    const {
      options: {
        comment,
        confirm,
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

    const componentDirectory = await getPackageEntrypointDirectory("component");
    const loadedDefinition = await loadEntrypoint(componentDirectory);
    const definition = { ...loadedDefinition, display: { ...loadedDefinition.display } };
    await validateDefinition(definition, { cwd: componentDirectory });

    const packagePath = await createComponentPackage(componentDirectory);

    // Optionally create a source code package if the --include-source flag is set
    let sourceCodePath: string | undefined;
    if (includeSource) {
      sourceCodePath = await createSourceCodePackage(componentDirectory);
    }

    if (checkSignature) {
      const signatureMatches = await checkPackageSignature(definition, packagePath);
      if (signatureMatches) {
        if (
          skipOnSignatureMatch ||
          !(await ux.confirm(
            "The new package signature matches the existing package signature. Continue publishing new package? (y/N)",
          ))
        ) {
          // Signatures match and we've opted to skip on match, so bail.
          ux.log("Package signatures match, skipping publish.");
          return {
            success: true as const,
            messages: ["Package signatures match, skipping publish."],
          };
        }
      }
    }

    const shouldPublish = await confirmPublish(definition, confirm);
    if (!shouldPublish) {
      return { success: true as const, messages: ["Publishing cancelled."] };
    }

    const {
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
      await uploadFile(resolve(componentDirectory, iconPath), iconUploadUrl);
    }

    // Upload source code if it was created and the API returned an upload URL
    if (sourceCodePath && sourceUploadUrl) {
      await uploadFile(sourceCodePath, sourceUploadUrl);
    }

    await uploadConnectionIcons(definition, connectionIconUploadUrls, componentDirectory);

    const {
      display: { label },
    } = definition;
    // Tell user that their publish was successful and can use components list to view status
    commandOutput.log(
      `Successfully submitted ${label} (v${versionNumber})! The publish should finish processing shortly.`,
    );
    return resultOutput(
      context,
      { submitted: true, label, versionNumber },
      {
        command: "components list",
        description: "Check component publication status",
      },
    );
  },
});

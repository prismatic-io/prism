import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { ux } from "../../utils/ux.js";
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

export default defineCommand({
  description: "Publish a Component to Prismatic",
  examples: [
    {
      description: "Build and publish a component:",
      command: "npm run build && <%= config.bin %> <%= command.id %>",
    },
  ],
  options: {
    comment: option.string({
      required: false,
      char: "c",
      description: "Comment about changes in this Publish",
    }),
    confirm: option.boolean({
      allowNo: true,
      default: true,
      description: "Interactively confirm publish",
    }),
    "check-signature": option.boolean({
      allowNo: true,
      default: true,
      description: "Check signature of existing component and confirm publish if matched",
    }),
    "skip-on-signature-match": option.boolean({
      required: false,
      description: "Skips component publish if the new signature matches the existing signature",
    }),
    customer: option.string({
      description: "ID of customer with which to associate the component",
    }),
    commitHash: option.string({
      required: false,
      description: "Commit hash corresponding to the component version being published",
    }),
    commitUrl: option.string({
      required: false,
      description: "URL to the commit details for this component version",
    }),
    repoUrl: option.string({
      required: false,
      description: "URL to the repository containing the component definition",
    }),
    pullRequestUrl: option.string({
      required: false,
      description: "URL to the pull request that modified this component version",
    }),
    "include-source": option.boolean({
      required: false,
      default: false,
      description: "Include source code in the component publish",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: {
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
    } = commandInput();

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

    const definition = await loadEntrypoint();
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
          !(await ux.confirm(
            "The new package signature matches the existing package signature. Continue publishing new package? (y/N)",
          ))
        ) {
          // Signatures match and we've opted to skip on match, so bail.
          ux.log("Package signatures match, skipping publish.");
          return;
        }
      }
    }

    const shouldPublish = await confirmPublish(definition, confirm);
    if (!shouldPublish) {
      return;
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
      await uploadFile(iconPath, iconUploadUrl);
    }

    // Upload source code if it was created and the API returned an upload URL
    if (sourceCodePath && sourceUploadUrl) {
      await uploadFile(sourceCodePath, sourceUploadUrl);
    }

    await uploadConnectionIcons(definition, connectionIconUploadUrls);

    const {
      display: { label },
    } = definition;
    // Tell user that their publish was successful and can use components list to view status
    commandOutput.log(
      `Successfully submitted ${label} (v${versionNumber})! The publish should finish processing shortly.`,
    );
  },
});

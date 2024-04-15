import { Command, Flags, ux } from "@oclif/core";
import {
  checkPackageSignature,
  confirmPublish,
  createComponentPackage,
  loadEntrypoint,
  publishDefinition,
  uploadConnectionIcons,
  uploadFile,
  validateDefinition,
} from "../../utils/component/publish.js";
import { whoAmI } from "../../utils/user/query.js";

export default class PublishCommand extends Command {
  static description = "Publish a Component to Prismatic";
  static flags = {
    comment: Flags.string({
      required: false,
      char: "c",
      description: "Comment about changes in this Publish",
    }),
    confirm: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Interactively confirm publish",
    }),
    "check-signature": Flags.boolean({
      allowNo: true,
      default: true,
      description: "Check signature of existing component and confirm publish if matched",
    }),
    "skip-on-signature-match": Flags.boolean({
      required: false,
      description: "Skips component publish if the new signature matches the existing signature",
    }),
    customer: Flags.string({
      description: "ID of customer with which to associate the component",
    }),
  };

  async run() {
    const {
      flags: {
        comment,
        confirm,
        "check-signature": checkSignature,
        "skip-on-signature-match": skipOnSignatureMatch,
        customer: flagCustomer,
      },
    } = await this.parse(PublishCommand);

    const me = await whoAmI();
    const customer = flagCustomer ?? me.customer?.id;

    const definition = await loadEntrypoint();
    await validateDefinition(definition);

    const packagePath = await createComponentPackage();

    if (checkSignature) {
      const signatureMatches = await checkPackageSignature(definition, packagePath, customer);
      if (signatureMatches) {
        if (
          skipOnSignatureMatch ||
          !(await ux.confirm(
            "The new package signature matches the existing package signature. Continue publishing new package? (y/N)",
          ))
        ) {
          // Signatures match and we've opted to skip on match, so bail.
          ux.log("Package signatures match, skipping publish.");
          ux.exit(0);
        }
      }
    }

    await confirmPublish(definition, confirm);

    const { iconUploadUrl, packageUploadUrl, connectionIconUploadUrls, versionNumber } =
      await publishDefinition(definition, comment, customer);

    const {
      display: { iconPath },
    } = definition;
    await uploadFile(packagePath, packageUploadUrl);
    await uploadFile(iconPath, iconUploadUrl);
    await uploadConnectionIcons(definition, connectionIconUploadUrls);

    const {
      display: { label },
    } = definition;
    // Tell user that their publish was successful and can use components list to view status
    this.log(
      `Successfully submitted ${label} (v${versionNumber})! The publish should finish processing shortly.`,
    );
  }
}

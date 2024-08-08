import { Flags } from "@oclif/core";
import crypto from "crypto";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { fs } from "../../fs.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";
import { getPackageSignatureFromApi } from "../../utils/component/signature.js";

export default class ComponentsSignatureCommand extends PrismaticBaseCommand {
  static description = "Generate a Component signature";

  static flags = {
    "skip-signature-verify": Flags.boolean({
      required: false,
      description:
        "This consistently returns a signature, regardless of whether the corresponding component has been published to the platform or not.",
    }),
  };

  async run() {
    const {
      flags: { "skip-signature-verify": skipSignatureVerify },
    } = await this.parse(ComponentsSignatureCommand);

    const componentDefinition = await loadEntrypoint();
    await validateDefinition(componentDefinition);
    const packagePath = await createComponentPackage();

    const packageSignature = crypto
      .createHash("sha1")
      .update(await fs.readFile(packagePath))
      .digest("hex");

    if (skipSignatureVerify) {
      return this.log(packageSignature);
    }

    const packageSignatureFromApi = await getPackageSignatureFromApi({
      componentDefinition,
      packageSignature,
    });

    return this.log(packageSignatureFromApi ?? "");
  }
}

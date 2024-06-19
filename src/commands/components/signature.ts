import { Command, Flags } from "@oclif/core";
import crypto from "crypto";

import { getPackageSignatureFromApi } from "../../utils/component/signature.js";
import { whoAmI } from "../../utils/user/query.js";
import { fs } from "../../fs.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";

export default class ComponentsSignatureCommand extends Command {
  static description = "Generate a Component signature";

  static flags = {
    customer: Flags.string({
      description: "ID of customer with which to associate the component",
    }),
    "skip-signature-verify": Flags.boolean({
      required: false,
      description:
        "This consistently returns a signature, regardless of whether the corresponding component signature is actually present in the API or not.",
    }),
  };

  async run() {
    const {
      flags: { customer: flagCustomer, "skip-signature-verify": skipSignatureVerification },
    } = await this.parse(ComponentsSignatureCommand);

    const componentDefinition = await loadEntrypoint();
    await validateDefinition(componentDefinition);
    const packagePath = await createComponentPackage();
    const me = await whoAmI();
    const customer = flagCustomer ?? me.customer?.id;

    const packageSignature = crypto
      .createHash("sha1")
      .update(await fs.readFile(packagePath))
      .digest("hex");

    if (skipSignatureVerification) {
      return this.log(packageSignature);
    }

    const packageSignatureFromApi = await getPackageSignatureFromApi({
      componentDefinition,
      customer,
      packageSignature,
    });

    return this.log(packageSignatureFromApi ?? "");
  }
}

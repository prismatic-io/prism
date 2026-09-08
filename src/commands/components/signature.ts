import { getPackageEntrypointDirectory } from "../../utils/import.js";
import crypto from "crypto";
import { defineCommand, optionsSchema } from "../../command.js";
import { fs } from "../../fs.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";
import { getPackageSignatureFromApi } from "../../utils/component/signature.js";
import { z } from "incur";

export default defineCommand({
  output: resourceOutputSchema("signature"),
  description: "Generate a Component signature",
  options: optionsSchema(
    z.object({
      "skip-signature-verify": z
        .boolean()
        .optional()
        .describe(
          "This consistently returns a signature, regardless of whether the corresponding component has been published to the platform or not.",
        ),
    }),
  ),
  async run(context) {
    const {
      options: { "skip-signature-verify": skipSignatureVerify },
    } = context;

    const componentDirectory = await getPackageEntrypointDirectory("component");
    const componentDefinition = await loadEntrypoint(componentDirectory);
    await validateDefinition(componentDefinition, { cwd: componentDirectory });
    const packagePath = await createComponentPackage(componentDirectory);

    const packageSignature = crypto
      .createHash("sha1")
      .update(await fs.readFile(packagePath))
      .digest("hex");

    if (skipSignatureVerify) {
      return resourceOutput(context, "signature", packageSignature);
    }

    const packageSignatureFromApi = await getPackageSignatureFromApi({
      componentDefinition,
      packageSignature,
    });

    return resourceOutput(context, "signature", packageSignatureFromApi ?? "");
  },
});

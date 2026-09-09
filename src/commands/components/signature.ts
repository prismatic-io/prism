import { withWorkingDirectory } from "../../command-context.js";
import { getPackageEntrypointDirectory } from "../../utils/import.js";
import crypto from "crypto";
import { fs } from "../../fs.js";
import { warningsOutput } from "../../output.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";
import { getPackageSignatureFromApi } from "../../utils/component/signature.js";
import { z, Cli } from "incur";

export default Cli.command({
  output: z.object({ signature: z.string() }).extend(warningsOutput),
  description: "Generate a Component signature",
  options: z.object({
    "skip-signature-verify": z
      .boolean()
      .optional()
      .describe(
        "This consistently returns a signature, regardless of whether the corresponding component has been published to the platform or not.",
      ),
  }),
  async run(context) {
    const {
      options: { "skip-signature-verify": skipSignatureVerify },
    } = context;

    return withWorkingDirectory(await getPackageEntrypointDirectory("component"), async () => {
      const componentDefinition = await loadEntrypoint();
      await validateDefinition(componentDefinition);
      const packagePath = await createComponentPackage();

      const packageSignature = crypto
        .createHash("sha1")
        .update(await fs.readFile(packagePath))
        .digest("hex");

      if (skipSignatureVerify) {
        return { signature: packageSignature };
      }

      const packageSignatureFromApi = await getPackageSignatureFromApi({
        componentDefinition,
        packageSignature,
      });

      return { signature: packageSignatureFromApi ?? "" };
    });
  },
});

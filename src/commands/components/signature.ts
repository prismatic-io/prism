import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import crypto from "crypto";
import { fs } from "../../fs.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../utils/component/index.js";
import { getPackageSignatureFromApi } from "../../utils/component/signature.js";

export default defineCommand({
  description: "Generate a Component signature",
  options: {
    "skip-signature-verify": option.boolean({
      required: false,
      description:
        "This consistently returns a signature, regardless of whether the corresponding component has been published to the platform or not.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { "skip-signature-verify": skipSignatureVerify },
    } = commandInput();

    const componentDefinition = await loadEntrypoint();
    await validateDefinition(componentDefinition);
    const packagePath = await createComponentPackage();

    const packageSignature = crypto
      .createHash("sha1")
      .update(await fs.readFile(packagePath))
      .digest("hex");

    if (skipSignatureVerify) {
      return commandOutput.log(packageSignature);
    }

    const packageSignatureFromApi = await getPackageSignatureFromApi({
      componentDefinition,
      packageSignature,
    });

    return commandOutput.log(packageSignatureFromApi ?? "");
  },
});

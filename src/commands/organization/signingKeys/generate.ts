import { open, rm } from "node:fs/promises";
import { Cli, z } from "incur";
import { GenerateSigningKeyDocument as GENERATE_SIGNING_KEY } from "../../../graphql/operations/generateSigningKey.generated.js";
import { gqlRequest, requireOperationResult } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

const generateSigningKey = async () => {
  const result = await gqlRequest({ document: GENERATE_SIGNING_KEY });
  return requireOperationResult(
    result.createOrganizationSigningKey?.result?.privateKey,
    "Signing key was not generated",
  );
};

export default Cli.command({
  output: z
    .object({
      privateKey: z.string().optional(),
      privateKeyFile: z.string().optional(),
    })
    .extend(warningsOutput),
  description:
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.",
  hint: "Use --private-key-file to write the private key to a new file readable only by you instead of printing it.",
  examples: [
    {
      description: "Write the private key to a file instead of printing it:",
      options: { "private-key-file": "prismatic-signing-key.pem" },
    },
  ],
  options: z.object({
    "private-key-file": z
      .string()
      .optional()
      .describe("new file to write the private key to instead of printing it"),
  }),
  async run(context) {
    const privateKeyFile = context.options["private-key-file"];
    if (!privateKeyFile) return { privateKey: await generateSigningKey() };

    // Claim the file before generating: the private key cannot be retrieved again,
    // so an unwritable or existing path must fail while nothing has changed.
    const file = await open(privateKeyFile, "wx", 0o600);
    let written = false;
    try {
      await file.writeFile(await generateSigningKey());
      written = true;
    } finally {
      await file.close();
      if (!written) await rm(privateKeyFile, { force: true });
    }
    return { privateKeyFile };
  },
  alias: { "private-key-file": "o" },
});

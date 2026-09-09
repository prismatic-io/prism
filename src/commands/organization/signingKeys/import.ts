import { readFile } from "node:fs/promises";
import { ImportPublicKeyDocument as IMPORT_PUBLIC_KEY } from "../../../graphql/operations/importPublicKey.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ signingKeyId: z.string() }).extend(warningsOutput),
  description:
    "Import a RSA public key for use with embedded marketplace.\nYou can use openssl to generate a new RSA key pair and import the public key.",
  examples: [
    { description: "Generate an RSA private key using openssl:" },
    { description: "Generate the associated RSA public key:" },
    { description: "Import the public key:", options: { "public-key-file": "my-public-key.pub" } },
  ],
  options: z.object({
    "public-key-file": z.string().describe("public key file"),
  }),
  async run(context) {
    const {
      options: { "public-key-file": publicKeyFile },
    } = context;

    const publicKey = await readFile(publicKeyFile, {
      encoding: "utf-8",
      flag: "r",
    });

    const result = await gqlRequest({
      document: IMPORT_PUBLIC_KEY,
      variables: { publicKey },
    });
    const requiredValue1 = result.importOrganizationSigningKey?.organizationSigningKey?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Signing key was not imported",
        exitCode: 2,
      });

    return {
      signingKeyId: requiredValue1,
    };
  },
  alias: { "public-key-file": "p" },
});

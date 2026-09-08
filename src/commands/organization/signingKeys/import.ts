import { readFile } from "node:fs/promises";
import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { ImportPublicKeyDocument as IMPORT_PUBLIC_KEY } from "../../../graphql/operations/importPublicKey.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("signingKeyId"),
  description:
    "Import a RSA public key for use with embedded marketplace.\nYou can use openssl to generate a new RSA key pair and import the public key.",
  examples: [
    { description: "Generate an RSA private key using openssl:" },
    { description: "Generate the associated RSA public key:" },
    { description: "Import the public key:", options: { "public-key-file": "my-public-key.pub" } },
  ],
  options: optionsSchema(
    z.object({
      "public-key-file": z
        .string()
        .describe("public key file")
        .meta({ cli: { char: "p" } }),
    }),
  ),
  async run(context) {
    const {
      options: { "public-key-file": publicKeyFile },
    } = context;

    const publicKey = await readFile(publicKeyFile, {
      encoding: "utf-8",
      flag: "r",
    });

    const result: ResultOf<typeof IMPORT_PUBLIC_KEY> = await gqlRequest({
      document: IMPORT_PUBLIC_KEY,
      variables: { publicKey },
    });

    return resourceOutput(
      context,
      "signingKeyId",
      result.importOrganizationSigningKey?.organizationSigningKey?.id ??
        commandOutput.error("Signing key was not imported"),
    );
  },
});

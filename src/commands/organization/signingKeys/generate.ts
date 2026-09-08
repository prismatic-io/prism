import { commandOutput, defineCommand } from "../../../command.js";
import { GenerateSigningKeyDocument as GENERATE_SIGNING_KEY } from "../../../graphql/operations/generateSigningKey.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("privateKey"),
  description:
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.",
  async run(_context) {
    const result: ResultOf<typeof GENERATE_SIGNING_KEY> = await gqlRequest({
      document: GENERATE_SIGNING_KEY,
    });
    return resourceOutput(
      _context,
      "privateKey",
      result.createOrganizationSigningKey?.result?.privateKey ??
        commandOutput.error("Signing key was not generated"),
    );
  },
});

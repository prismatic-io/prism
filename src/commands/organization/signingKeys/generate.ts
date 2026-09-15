import { Cli, z } from "incur";
import { GenerateSigningKeyDocument as GENERATE_SIGNING_KEY } from "../../../graphql/operations/generateSigningKey.generated.js";
import { gqlRequest, requireOperationResult } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z.object({ privateKey: z.string() }).extend(warningsOutput),
  description:
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.",
  async run(_context) {
    const result = await gqlRequest({
      document: GENERATE_SIGNING_KEY,
    });
    const requiredValue1 = requireOperationResult(
      result.createOrganizationSigningKey?.result?.privateKey,
      "Signing key was not generated",
    );
    return {
      privateKey: requiredValue1,
    };
  },
});

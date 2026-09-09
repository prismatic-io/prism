import { GenerateSigningKeyDocument as GENERATE_SIGNING_KEY } from "../../../graphql/operations/generateSigningKey.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { Cli, z, Errors } from "incur";

export default Cli.command({
  output: z.object({ privateKey: z.string() }).extend(warningsOutput),
  description:
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.",
  async run(_context) {
    const result = await gqlRequest({
      document: GENERATE_SIGNING_KEY,
    });
    const requiredValue1 = result.createOrganizationSigningKey?.result?.privateKey;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Signing key was not generated",
        exitCode: 2,
      });
    return {
      privateKey: requiredValue1,
    };
  },
});

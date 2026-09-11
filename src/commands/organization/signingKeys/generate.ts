import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { GenerateSigningKeyDocument as GENERATE_SIGNING_KEY } from "../../../graphql/operations/generateSigningKey.generated.js";
import { gqlRequest } from "../../../graphql.js";

export default class GenerateCommand extends PrismaticBaseCommand {
  static description =
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.";

  async run() {
    await this.parse(GenerateCommand);
    const result = await gqlRequest({
      document: GENERATE_SIGNING_KEY,
    });
    const privateKey = result.createOrganizationSigningKey?.result?.privateKey;
    if (privateKey == null) {
      this.error("The operation returned no resource");
    }

    this.log(privateKey);
  }
}

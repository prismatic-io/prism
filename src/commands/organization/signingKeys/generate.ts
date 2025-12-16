import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class GenerateCommand extends PrismaticBaseCommand {
  static description =
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.";

  async run() {
    const result = await gqlRequest({
      document: gql`
        mutation generateSigningKey {
          createOrganizationSigningKey(input: {}) {
            result {
              privateKey
            }
          }
        }
      `,
    });
    this.log(result.createOrganizationSigningKey.result.privateKey);
  }
}

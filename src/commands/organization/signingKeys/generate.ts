import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class GenerateCommand extends PrismaticBaseCommand {
  static description = "Generate an embedded marketplace signing key";

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

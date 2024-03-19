import { Command } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

export default class GenerateCommand extends Command {
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

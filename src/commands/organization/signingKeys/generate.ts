import { commandOutput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description:
    "Generate an embedded marketplace signing key.\nThe RSA public key is saved in Prismatic, and the private key is returned and immediately removed from Prismatic. Once the private key is returned, it cannot be retrieved again.",
  async run(_context: CommandContext) {
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
    commandOutput.log(result.createOrganizationSigningKey.result.privateKey);
  },
});

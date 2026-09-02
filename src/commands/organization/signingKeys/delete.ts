import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Delete an embedded marketplace signing key",
  args: {
    signingKeyId: arg.string({
      required: true,
      description: "ID of the signing key to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { signingKeyId },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation ($id: ID!) {
          deleteOrganizationSigningKey(input: { id: $id }) {
            organizationSigningKey {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: signingKeyId,
      },
    });
  },
});

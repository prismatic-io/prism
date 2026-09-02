import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  description: "List embedded signing keys for embedded marketplace",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    const result = await gqlRequest({
      document: gql`
        query listOrganizationSigningKeys {
          organization {
            signingKeys {
              nodes {
                id
                publicKey
                privateKeyPreview
                issuedAt
                imported
              }
            }
          }
        }
      `,
    });

    return ux.table(
      result.organization.signingKeys.nodes,
      {
        id: { minWidth: 8, extended: true },
        privateKeyPreview: { header: "Private Key Preview" },
        publicKey: { header: "Public Key", extended: true },
        issuedAt: { header: "Timestamp" },
        imported: { header: "Imported?" },
      },
      { ...flags },
    );
  },
});

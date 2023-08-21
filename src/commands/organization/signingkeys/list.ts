import { Command, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List embedded signing keys for embedded marketplace";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

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

    ux.table(
      result.organization.signingKeys.nodes,
      {
        id: { minWidth: 8, extended: true },
        privateKeyPreview: { header: "Private Key Preview" },
        publicKey: { header: "Public Key", extended: true },
        issuedAt: { header: "Timestamp" },
        imported: { header: "Imported?" },
      },
      { ...flags }
    );
  }
}

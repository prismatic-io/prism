import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { ListOrganizationSigningKeysDocument as LIST_ORGANIZATION_SIGNING_KEYS } from "../../../graphql/operations/listOrganizationSigningKeys.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List embedded signing keys for embedded marketplace";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: LIST_ORGANIZATION_SIGNING_KEYS,
    });

    ux.table(
      result.organization?.signingKeys.nodes ?? this.error("Organization not found"),
      {
        id: { minWidth: 8, extended: true },
        privateKeyPreview: { header: "Private Key Preview" },
        publicKey: { header: "Public Key", extended: true },
        issuedAt: { header: "Timestamp" },
        imported: { header: "Imported?" },
      },
      { ...flags },
    );
  }
}

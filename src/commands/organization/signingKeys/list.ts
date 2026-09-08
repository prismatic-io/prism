import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListOrganizationSigningKeysDocument as LIST_ORGANIZATION_SIGNING_KEYS } from "../../../graphql/operations/listOrganizationSigningKeys.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List embedded signing keys for embedded marketplace";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_ORGANIZATION_SIGNING_KEYS> = await gqlRequest({
      document: LIST_ORGANIZATION_SIGNING_KEYS,
    });

    ux.table(
      requireResource(result.organization, "Organization").signingKeys.nodes,
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

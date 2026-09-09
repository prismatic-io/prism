import { tableOutputSchema, tableFlags, printTable } from "../../../utils/table.js";
import { ListOrganizationSigningKeysDocument as LIST_ORGANIZATION_SIGNING_KEYS } from "../../../graphql/operations/listOrganizationSigningKeys.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { z, Cli } from "incur";
export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "privateKeyPreview", "publicKey", "issuedAt", "imported"]),
  description: "List embedded signing keys for embedded marketplace",
  options: z.object({ ...tableFlags() }),
  async run(context) {
    const { options: flags } = context;

    const result = await gqlRequest({
      document: LIST_ORGANIZATION_SIGNING_KEYS,
    });

    return printTable(
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
  },
});

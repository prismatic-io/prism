import { tableOutputSchema } from "../../../utils/table.js";
import { ListOrganizationSigningKeysDocument as LIST_ORGANIZATION_SIGNING_KEYS } from "../../../graphql/operations/listOrganizationSigningKeys.generated.js";
import { defineCommand, optionsSchema } from "../../../command.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "privateKeyPreview", "publicKey", "issuedAt", "imported"]),
  description: "List embedded signing keys for embedded marketplace",
  options: optionsSchema(z.object({ ...ux.table.flags() })),
  async run(context) {
    const { options: flags } = context;

    const result: ResultOf<typeof LIST_ORGANIZATION_SIGNING_KEYS> = await gqlRequest({
      document: LIST_ORGANIZATION_SIGNING_KEYS,
    });

    return ux.table(
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

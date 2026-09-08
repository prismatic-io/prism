import { tableOutputSchema } from "../../../utils/table.js";
import { ListCustomerRolesDocument as LIST_CUSTOMER_ROLES } from "../../../graphql/operations/listCustomerRoles.generated.js";
import { defineCommand, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "description"]),
  description: "List Roles you can grant to Customer Users",
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
    }),
  ),
  async run(context) {
    const { options: flags } = context;

    const result: ResultOf<typeof LIST_CUSTOMER_ROLES> = await gqlRequest({
      document: LIST_CUSTOMER_ROLES,
    });

    return ux.table(
      result.customerRoles,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
      },
      { ...flags },
    );
  },
});

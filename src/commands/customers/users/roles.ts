import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListCustomerRolesDocument as LIST_CUSTOMER_ROLES } from "../../../graphql/operations/listCustomerRoles.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Roles you can grant to Customer Users";

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_CUSTOMER_ROLES> = await gqlRequest({
      document: LIST_CUSTOMER_ROLES,
    });

    ux.table(
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
  }
}

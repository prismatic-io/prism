import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListOrganizationRolesDocument as LIST_ORGANIZATION_ROLES } from "../../../graphql/operations/listOrganizationRoles.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Roles you can grant to other users in your Organization";

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result: ResultOf<typeof LIST_ORGANIZATION_ROLES> = await gqlRequest({
      document: LIST_ORGANIZATION_ROLES,
    });

    ux.table(
      result.organizationRoles,
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

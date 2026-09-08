import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListOrganizationUsersDocument as LIST_USERS } from "../../../graphql/organization/listOrganizationUsers.generated.js";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Users of your Organization";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customerUsers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const result: ResultOf<typeof LIST_USERS> = await gqlRequest({
        document: LIST_USERS,
        variables: { after: cursor },
      });
      const {
        users: { nodes, pageInfo },
      } = requireResource(result.organization, "Organization");
      customerUsers = [...customerUsers, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      customerUsers,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        email: {},
        phone: {},
        role: {
          get: ({ role }) => role.name,
        },
        externalId: {
          get: ({ externalId }) => externalId || "",
        },
      },
      { ...flags },
    );
  }
}

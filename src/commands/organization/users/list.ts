import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListOrganizationUsersDocument as LIST_ORGANIZATION_USERS,
  type ListOrganizationUsersQuery,
} from "../../../graphql/organization/listOrganizationUsers.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Users of your Organization";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customerUsers: OrganizationUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const response: ListOrganizationUsersQuery = await gqlRequest({
        document: LIST_ORGANIZATION_USERS,
        variables: { after: cursor },
      });
      const {
        users: { nodes, pageInfo },
      } = requireResource(response.organization, "organization");
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

type OrganizationUserNode = NonNullable<
  ListOrganizationUsersQuery["organization"]
>["users"]["nodes"][number];

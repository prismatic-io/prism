import {
  ListOrganizationUsersDocument as LIST_ORGANIZATION_USERS,
  type ListOrganizationUsersQuery,
} from "../../../graphql/organization/listOrganizationUsers.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";
type OrganizationUserNode = NonNullable<
  ListOrganizationUsersQuery["organization"]
>["users"]["nodes"][number];

const isOrganizationUserNode = (node: OrganizationUserNode | null): node is OrganizationUserNode =>
  node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "email", "phone", "role", "externalId"], true),
  description: "List Users of your Organization",
  options: z.object({ ...tableFlags(), ...paginationFlags() }),
  async run(context) {
    const { options: flags } = context;

    let customerUsers: OrganizationUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const response: ListOrganizationUsersQuery = await gqlRequest({
        document: LIST_ORGANIZATION_USERS,
        variables: { after: cursor, first: flags.first },
      });
      const resource = requireResource(response.organization, "Organization");
      const { nodes, pageInfo } = resource.users;
      customerUsers = [...customerUsers, ...nodes.filter(isOrganizationUserNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
    return { ...result, pageInfo: finalPageInfo };
  },
});

import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import type { Scalars } from "../../../graphql/schema.generated.js";
import { ux } from "../../../utils/ux.js";

interface OrganizationUserNode {
  [key: string]: unknown;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  externalId?: Scalars["String"]["output"] | null;
  phone?: Scalars["String"]["output"] | null;
  role: { name: Scalars["String"]["output"] };
}

interface ListUsersQuery {
  organization: {
    users: {
      nodes: Array<OrganizationUserNode | null>;
      pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
  };
}

const isOrganizationUserNode = (node: OrganizationUserNode | null): node is OrganizationUserNode =>
  node !== null;

export default defineCommand({
  description: "List Users of your Organization",
  options: { ...ux.table.flags() },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

    let customerUsers: OrganizationUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        organization: {
          users: { nodes, pageInfo },
        },
      }: ListUsersQuery = await gqlRequest<ListUsersQuery>({
        document: gql`
          query listUsers($after: String) {
            organization {
              users(after: $after) {
                nodes {
                  id
                  name
                  email
                  externalId
                  phone
                  role {
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `,
        variables: { after: cursor },
      });
      customerUsers = [...customerUsers, ...nodes.filter(isOrganizationUserNode)];
      cursor = pageInfo.endCursor ?? null;
      hasNextPage = pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});

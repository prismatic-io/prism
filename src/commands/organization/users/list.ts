import { defineCommand, optionsSchema } from "../../../command.js";
import type { ListOrganizationUsersQuery } from "../../../graphql/organization/listOrganizationUsers.generated.js";
import { ListOrganizationUsersDocument as LIST_ORGANIZATION_USERS } from "../../../graphql/organization/listOrganizationUsers.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

type OrganizationUserNode = NonNullable<
  NonNullable<ListOrganizationUsersQuery["organization"]>["users"]["nodes"][number]
>;

const isOrganizationUserNode = (node: OrganizationUserNode | null): node is OrganizationUserNode =>
  node !== null;

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "email", "phone", "role", "externalId"], true),
  description: "List Users of your Organization",
  options: optionsSchema(z.object({ ...ux.table.flags(), ...paginationFlags() })),
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
      const response: ResultOf<typeof LIST_ORGANIZATION_USERS> = await gqlRequest({
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

    const result = ux.table(
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

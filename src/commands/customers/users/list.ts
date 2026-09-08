import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListCustomerUsersDocument as LIST_CUSTOMER_USERS } from "../../../graphql/customers/listCustomerUsers.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Customer Users";
  static args = {
    customer: Args.string({
      description: "ID of the customer",
      required: true,
    }),
  };

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { customer },
      flags,
    } = await this.parse(ListCommand);

    let customerUsers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const result: ResultOf<typeof LIST_CUSTOMER_USERS> = await gqlRequest({
        document: LIST_CUSTOMER_USERS,
        variables: { id: customer, after: cursor },
      });
      const {
        users: { nodes, pageInfo },
      } = requireResource(result.customer, "Customer");
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
        role: { get: ({ role: { name } }) => name },
        externalId: {
          extended: true,
          get: ({ externalId }) => externalId || "",
        },
      },
      { ...flags },
    );
  }
}

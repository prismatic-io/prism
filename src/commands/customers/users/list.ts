import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListCustomerUsersDocument as LIST_CUSTOMER_USERS,
  type ListCustomerUsersQuery,
} from "../../../graphql/customers/listCustomerUsers.generated.js";
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

    let customerUsers: CustomerUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const response: ListCustomerUsersQuery = await gqlRequest({
        document: LIST_CUSTOMER_USERS,
        variables: { id: customer, after: cursor },
      });
      const {
        users: { nodes, pageInfo },
      } = requireResource(response.customer, "customer");
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

type CustomerUserNode = NonNullable<ListCustomerUsersQuery["customer"]>["users"]["nodes"][number];

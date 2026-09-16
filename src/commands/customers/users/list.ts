import { Cli, z } from "incur";
import {
  ListCustomerUsersDocument as LIST_CUSTOMER_USERS,
  type ListCustomerUsersQuery,
} from "../../../graphql/customers/listCustomerUsers.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { requestFailure } from "../../../utils/failure.js";
import { checkPageCursor, nextPageOptions } from "../../../utils/pagination.js";
import { paginationFlags, printTable, tableFlags } from "../../../utils/table.js";
import { customerUserRowSchema, nonBlank, pageInfoSchema } from "../schemas.js";

type CustomerUserNode = NonNullable<ListCustomerUsersQuery["customer"]>["users"]["nodes"][number];

const isCustomerUserNode = (node: CustomerUserNode | null): node is CustomerUserNode =>
  node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: z.object({ items: z.array(customerUserRowSchema), pageInfo: pageInfoSchema }),
  description: "List Customer Users",
  args: z.object({
    customer: nonBlank.describe("ID of the customer"),
  }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
  }),
  async run(context) {
    const {
      args: { customer },
      options: flags,
    } = context;

    try {
      let customerUsers: CustomerUserNode[] = [];
      let hasNextPage = true;
      let cursor: string | null = flags.after ?? "";
      let finalPageInfo: { hasNextPage: boolean; endCursor: string | null } = {
        hasNextPage: false,
        endCursor: null,
      };

      const seenCursors = new Set<string>([cursor]);
      while (hasNextPage) {
        const response: ListCustomerUsersQuery = await gqlRequest({
          document: LIST_CUSTOMER_USERS,
          variables: { id: customer, after: cursor, first: flags.first },
        });
        const resource = requireResource(response.customer, "Customer");
        const { nodes, pageInfo } = resource.users;
        customerUsers = [...customerUsers, ...nodes.filter(isCustomerUserNode)];
        checkPageCursor(pageInfo, seenCursors);
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
          role: { get: ({ role: { name } }) => name },
          externalId: {
            extended: true,
            get: ({ externalId }) => externalId,
          },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo: finalPageInfo },
        context.agent && finalPageInfo.hasNextPage && finalPageInfo.endCursor
          ? {
              cta: {
                commands: [
                  {
                    command: "customers users list",
                    args: { customer },
                    description: "Fetch the next page of this customer's users",
                    options: nextPageOptions(flags, finalPageInfo.endCursor),
                  },
                ],
              },
            }
          : undefined,
      );
    } catch (error) {
      return context.error(requestFailure(error, "CUSTOMER_USERS_LIST_FAILED", true));
    }
  },
});

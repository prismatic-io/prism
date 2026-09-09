import {
  ListCustomerUsersDocument as LIST_CUSTOMER_USERS,
  type ListCustomerUsersQuery,
} from "../../../graphql/customers/listCustomerUsers.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";
type CustomerUserNode = NonNullable<ListCustomerUsersQuery["customer"]>["users"]["nodes"][number];

const isCustomerUserNode = (node: CustomerUserNode | null): node is CustomerUserNode =>
  node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "email", "role", "externalId"], true),
  description: "List Customer Users",
  args: z.object({
    customer: z.string().describe("ID of the customer"),
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

    let customerUsers: CustomerUserNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const response: ListCustomerUsersQuery = await gqlRequest({
        document: LIST_CUSTOMER_USERS,
        variables: { id: customer, after: cursor, first: flags.first },
      });
      const resource = requireResource(response.customer, "Customer");
      const { nodes, pageInfo } = resource.users;
      customerUsers = [...customerUsers, ...nodes.filter(isCustomerUserNode)];
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
          get: ({ externalId }) => externalId || "",
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo: finalPageInfo };
  },
});

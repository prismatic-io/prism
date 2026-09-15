import { customerRowSchema, pageInfoSchema } from "./schemas.js";
import { checkPageCursor, nextPageOptions } from "../../utils/pagination.js";
import { requestFailure } from "../../utils/failure.js";
import type { ListCustomersQuery } from "../../graphql/customers/listCustomers.generated.js";
import { ListCustomersDocument as LIST_CUSTOMERS } from "../../graphql/customers/listCustomers.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type CustomerNode = ListCustomersQuery["customers"]["nodes"][number];

const isCustomerNode = (node: CustomerNode | null): node is CustomerNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List your Customers",
  output: z.object({ items: z.array(customerRowSchema), pageInfo: pageInfoSchema }),
  options: z.object({ ...tableFlags(), ...paginationFlags() }),
  async run(context) {
    const { options: flags } = context;

    try {
      let customers: CustomerNode[] = [];
      let hasNextPage = true;
      let cursor: string | null = flags.after ?? "";
      let pageInfo: ListCustomersQuery["customers"]["pageInfo"] = {
        hasNextPage: false,
        endCursor: null,
      };

      const seenCursors = new Set<string>([cursor]);
      while (hasNextPage) {
        const {
          customers: { nodes, pageInfo: nextPageInfo },
        }: ListCustomersQuery = await gqlRequest({
          document: LIST_CUSTOMERS,
          variables: { after: cursor, first: flags.first },
        });
        customers = [...customers, ...nodes.filter(isCustomerNode)];
        checkPageCursor(nextPageInfo, seenCursors);
        pageInfo = nextPageInfo;
        cursor = nextPageInfo.endCursor ?? null;
        hasNextPage = nextPageInfo.hasNextPage && (flags.all === true || !context.agent);
      }

      const result = printTable(
        customers,
        {
          id: {
            minWidth: 8,
            extended: true,
          },
          externalId: {
            extended: true,
            get: ({ externalId }) => externalId,
          },
          name: {},
          description: {},
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        context.agent && pageInfo.hasNextPage && pageInfo.endCursor
          ? {
              cta: {
                commands: [
                  {
                    command: "customers list",
                    description: "Fetch the next page of customers",
                    options: nextPageOptions(flags, pageInfo.endCursor),
                  },
                ],
              },
            }
          : undefined,
      );
    } catch (error) {
      return context.error(requestFailure(error, "CUSTOMER_LIST_FAILED", true));
    }
  },
});

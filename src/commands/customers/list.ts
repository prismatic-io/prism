import type { ListCustomersQuery } from "../../graphql/customers/listCustomers.generated.js";
import { ListCustomersDocument as LIST_CUSTOMERS } from "../../graphql/customers/listCustomers.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type CustomerNode = ListCustomersQuery["customers"]["nodes"][number];

const isCustomerNode = (node: CustomerNode | null): node is CustomerNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List your Customers",
  output: tableOutputSchema(["id", "name", "externalId", "description"], true),
  options: z.object({ ...tableFlags(), ...paginationFlags() }),
  async run(context) {
    const { options: flags } = context;

    let customers: CustomerNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let pageInfo: ListCustomersQuery["customers"]["pageInfo"] = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        customers: { nodes, pageInfo: nextPageInfo },
      }: ListCustomersQuery = await gqlRequest({
        document: LIST_CUSTOMERS,
        variables: { after: cursor, first: flags.first },
      });
      customers = [...customers, ...nodes.filter(isCustomerNode)];
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
          get: ({ externalId }) => externalId || "",
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
                  options: {
                    after: pageInfo.endCursor,
                    ...(flags.first !== undefined ? { first: flags.first } : {}),
                  },
                },
              ],
            },
          }
        : undefined,
    );
  },
});

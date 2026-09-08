import { defineCommand, optionsSchema } from "../../command.js";
import type { ListCustomersQuery } from "../../graphql/customers/listCustomers.generated.js";
import { ListCustomersDocument as LIST_CUSTOMERS } from "../../graphql/customers/listCustomers.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema } from "../../utils/table.js";
import { ux } from "../../utils/ux.js";
import { z } from "incur";

type CustomerNode = NonNullable<ListCustomersQuery["customers"]["nodes"][number]>;

const isCustomerNode = (node: CustomerNode | null): node is CustomerNode => node !== null;

export default defineCommand({
  outputPolicy: "agent-only",
  description: "List your Customers",
  output: tableOutputSchema(["id", "name", "externalId", "description"], true),
  options: optionsSchema(z.object({ ...ux.table.flags(), ...paginationFlags() })),
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

    const result = ux.table(
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
    return { ...result, pageInfo };
  },
});

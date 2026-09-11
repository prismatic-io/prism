import { PrismaticBaseCommand } from "../../baseCommand.js";
import {
  ListCustomersDocument as LIST_CUSTOMERS,
  type ListCustomersQuery,
} from "../../graphql/customers/listCustomers.generated.js";
import { gqlRequest } from "../../graphql.js";
import { ux } from "../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List your Customers";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customers: CustomerNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        customers: { nodes, pageInfo },
      }: ListCustomersQuery = await gqlRequest({
        document: LIST_CUSTOMERS,
        variables: { after: cursor },
      });
      customers = [...customers, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
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
  }
}

type CustomerNode = ListCustomersQuery["customers"]["nodes"][number];

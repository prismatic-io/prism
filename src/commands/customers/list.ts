import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListCustomersDocument as LIST_CUSTOMERS } from "../../graphql/customers/listCustomers.generated.js";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest } from "../../graphql.js";
import { ux } from "../../utils/legacy-ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List your Customers";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        customers: { nodes, pageInfo },
      }: ResultOf<typeof LIST_CUSTOMERS> = await gqlRequest({
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

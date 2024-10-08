import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List On-Premise Resources";
  static flags = {
    ...ux.table.flags(),
    customer: Flags.string({
      char: "c",
      description:
        "If specified this command returns only On-Premise Resources that are available to the specified customer ID",
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { customer } = flags;

    let onPremiseResources: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        onPremiseResources: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listOnPremiseResources($after: String, $customer: ID) {
            onPremiseResources(after: $after, customer: $customer) {
              nodes {
                id
                name
                status
                customer {
                  id
                  name
                  externalId
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: {
          after: cursor,
          customer,
        },
      });
      onPremiseResources = [...onPremiseResources, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      onPremiseResources,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        customerId: { header: "Customer ID", extended: true, get: (row) => row.customer?.id ?? "" },
        status: { get: (row) => row.status ?? "" },
        customer: { get: (row) => row.customer?.name ?? "" },
        customerExternalId: {
          header: "Customer External ID",
          extended: true,
          get: (row) => row.customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
  }
}

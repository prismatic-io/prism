import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import {
  ListOnPremiseResourcesDocument as LIST_ON_PREMISE_RESOURCES,
  type ListOnPremiseResourcesQuery,
} from "../../graphql/onPremResources/listOnPremiseResources.generated.js";
import { gqlRequest } from "../../graphql.js";
import { ux } from "../../utils/ux.js";

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

    let onPremiseResources: OnPremiseResourceNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        onPremiseResources: { nodes, pageInfo },
      }: ListOnPremiseResourcesQuery = await gqlRequest({
        document: LIST_ON_PREMISE_RESOURCES,
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
        status: { get: (row) => row.status },
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

type OnPremiseResourceNode = ListOnPremiseResourcesQuery["onPremiseResources"]["nodes"][number];

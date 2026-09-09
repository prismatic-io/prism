import type { ListOnPremiseResourcesQuery } from "../../graphql/onPremResources/listOnPremiseResources.generated.js";
import { ListOnPremiseResourcesDocument as LIST_ON_PREMISE_RESOURCES } from "../../graphql/onPremResources/listOnPremiseResources.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type OnPremiseResourceNode = ListOnPremiseResourcesQuery["onPremiseResources"]["nodes"][number];

const isOnPremiseResourceNode = (
  node: OnPremiseResourceNode | null,
): node is OnPremiseResourceNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List On-Premise Resources",
  output: tableOutputSchema(
    ["id", "name", "customerId", "status", "customer", "customerExternalId"],
    true,
  ),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    customer: z
      .string()
      .optional()
      .describe(
        "If specified this command returns only On-Premise Resources that are available to the specified customer ID",
      ),
  }),
  async run(context) {
    const { options: flags } = context;
    const { customer } = flags;

    let onPremiseResources: OnPremiseResourceNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let pageInfo: ListOnPremiseResourcesQuery["onPremiseResources"]["pageInfo"] = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        onPremiseResources: { nodes, pageInfo: nextPageInfo },
      }: ListOnPremiseResourcesQuery = await gqlRequest({
        document: LIST_ON_PREMISE_RESOURCES,
        variables: {
          after: cursor,
          customer,
          first: flags.first,
        },
      });
      onPremiseResources = [...onPremiseResources, ...nodes.filter(isOnPremiseResourceNode)];
      pageInfo = nextPageInfo;
      cursor = nextPageInfo.endCursor ?? null;
      hasNextPage = nextPageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
    return { ...result, pageInfo };
  },
  alias: { customer: "c" },
});

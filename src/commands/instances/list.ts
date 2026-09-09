import type { ListInstancesQuery } from "../../graphql/instances/listInstances.generated.js";
import { ListInstancesDocument as LIST_INSTANCES } from "../../graphql/instances/listInstances.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type InstanceNode = ListInstancesQuery["instances"]["nodes"][number];

const isInstanceNode = (node: InstanceNode | null): node is InstanceNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List Instances",
  output: tableOutputSchema(
    ["id", "name", "customer", "customerid", "customerExternalId", "description", "enabled"],
    true,
  ),
  options: z.object({
    customer: z.string().optional().describe("ID of a customer"),
    integration: z.string().optional().describe("ID of an integration"),
    ...tableFlags(),
    ...paginationFlags(),
  }),
  async run(context) {
    const { options: flags } = context;
    const { customer, integration } = flags;

    let instances: InstanceNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let pageInfo: ListInstancesQuery["instances"]["pageInfo"] = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        instances: { nodes, pageInfo: nextPageInfo },
      }: ListInstancesQuery = await gqlRequest({
        document: LIST_INSTANCES,
        variables: {
          customer,
          integration,
          after: cursor,
          first: flags.first,
        },
      });
      instances = [...instances, ...nodes.filter(isInstanceNode)];
      pageInfo = nextPageInfo;
      cursor = nextPageInfo.endCursor ?? null;
      hasNextPage = nextPageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
      instances,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        customer: {
          get: ({ customer }) => customer.name,
        },
        customerid: {
          get: ({ customer }) => customer.id,
          extended: true,
        },
        customerExternalId: {
          get: ({ customer }) => customer.externalId || "",
          extended: true,
        },
        description: {},
        enabled: { extended: true },
      },
      { ...flags },
    );
    return { ...result, pageInfo };
  },
  alias: { integration: "i", customer: "c" },
});

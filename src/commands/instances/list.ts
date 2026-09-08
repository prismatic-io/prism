import { defineCommand, optionsSchema } from "../../command.js";
import type { ListInstancesQuery } from "../../graphql/instances/listInstances.generated.js";
import { ListInstancesDocument as LIST_INSTANCES } from "../../graphql/instances/listInstances.generated.js";
import { gqlRequest } from "../../graphql.js";
import { ux } from "../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../utils/table.js";
import { z } from "incur";

type InstanceNode = NonNullable<ListInstancesQuery["instances"]["nodes"][number]>;

const isInstanceNode = (node: InstanceNode | null): node is InstanceNode => node !== null;

export default defineCommand({
  outputPolicy: "agent-only",
  description: "List Instances",
  output: tableOutputSchema(
    ["id", "name", "customer", "customerid", "customerExternalId", "description", "enabled"],
    true,
  ),
  options: optionsSchema(
    z.object({
      customer: z
        .string()
        .optional()
        .describe("ID of a customer")
        .meta({ cli: { char: "c" } }),
      integration: z
        .string()
        .optional()
        .describe("ID of an integration")
        .meta({ cli: { char: "i" } }),
      ...ux.table.flags(),
      ...paginationFlags(),
    }),
  ),
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

    const result = ux.table(
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
});

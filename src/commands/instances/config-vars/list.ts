import {
  ListInstanceConfigVariablesDocument as LIST_INSTANCE_CONFIG_VARIABLES,
  type ListInstanceConfigVariablesQuery,
} from "../../../graphql/instances/listInstanceConfigVariables.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli } from "incur";
type InstanceConfigVariableNode = NonNullable<
  ListInstanceConfigVariablesQuery["instance"]
>["configVariables"]["nodes"][number];

const isInstanceConfigVariableNode = (
  node: InstanceConfigVariableNode | null,
): node is InstanceConfigVariableNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "requiredVariableId", "key", "value", "defaultValue"], true),
  description: "List Config Variables used on an Instance",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
  }),
  async run(context) {
    const {
      args: { instance },
      options: flags,
    } = context;

    let configVariables: InstanceConfigVariableNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const response: ListInstanceConfigVariablesQuery = await gqlRequest({
        document: LIST_INSTANCE_CONFIG_VARIABLES,
        variables: {
          id: instance,
          after: cursor,
          first: flags.first,
        },
      });
      const resource = requireResource(response.instance, "Instance");
      const { nodes, pageInfo } = resource.configVariables;
      configVariables = [...configVariables, ...nodes.filter(isInstanceConfigVariableNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
      configVariables,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        requiredVariableId: {
          get: (row) => row.requiredConfigVariable.id,
          extended: true,
        },
        key: {
          get: (row) => row.requiredConfigVariable.key,
        },
        value: {
          get: (row) =>
            row.requiredConfigVariable.dataType === "CONNECTION" ? row.inputs : row.value,
        },
        defaultValue: {
          get: (row) =>
            row.requiredConfigVariable.dataType === "CONNECTION"
              ? ""
              : row.requiredConfigVariable.defaultValue,
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo: finalPageInfo };
  },
});

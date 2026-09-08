import { defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import type { ListInstanceFlowConfigsQuery } from "../../../graphql/instances/listInstanceFlowConfigs.generated.js";
import { ListInstanceFlowConfigsDocument as LIST_INSTANCE_FLOW_CONFIGS } from "../../../graphql/instances/listInstanceFlowConfigs.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

type InstanceFlowConfigNode = NonNullable<
  NonNullable<ListInstanceFlowConfigsQuery["instance"]>["flowConfigs"]["nodes"][number]
>;

const isInstanceFlowConfigNode = (
  node: InstanceFlowConfigNode | null,
): node is InstanceFlowConfigNode => node !== null;

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "webhookUrl"], true),
  description: "List Instance Flow Configs",
  args: argsSchema(
    z.object({
      instance: z.string().describe("ID of an Instance"),
    }),
  ),
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
      ...paginationFlags(),
    }),
  ),
  async run(context) {
    const {
      args: { instance },
      options: flags,
    } = context;

    let flowConfigs: InstanceFlowConfigNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const response: ResultOf<typeof LIST_INSTANCE_FLOW_CONFIGS> = await gqlRequest({
        document: LIST_INSTANCE_FLOW_CONFIGS,
        variables: {
          id: instance,
          after: cursor,
          first: flags.first,
        },
      });
      const resource = requireResource(response.instance, "Instance");
      const { nodes, pageInfo } = resource.flowConfigs;
      flowConfigs = [...flowConfigs, ...nodes.filter(isInstanceFlowConfigNode)];
      cursor = pageInfo.endCursor ?? null;
      finalPageInfo = pageInfo;
      hasNextPage = pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = ux.table(
      flowConfigs,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row) => row.flow.name,
        },
        webhookUrl: {
          extended: true,
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo: finalPageInfo };
  },
});

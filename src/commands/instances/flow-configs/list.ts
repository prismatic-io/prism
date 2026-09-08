import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListInstanceFlowConfigsDocument as LIST_INSTANCE_FLOW_CONFIGS } from "../../../graphql/instances/listInstanceFlowConfigs.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Instance Flow Configs";
  static args = {
    instance: Args.string({ description: "ID of an Instance", required: true }),
  };
  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { instance },
      flags,
    } = await this.parse(ListCommand);

    let flowConfigs: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const result: ResultOf<typeof LIST_INSTANCE_FLOW_CONFIGS> = await gqlRequest({
        document: LIST_INSTANCE_FLOW_CONFIGS,
        variables: {
          id: instance,
          after: cursor,
        },
      });
      const {
        flowConfigs: { nodes, pageInfo },
      } = requireResource(result.instance, "Instance");
      flowConfigs = [...flowConfigs, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      flowConfigs,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row: any) => row.flow.name,
        },
        webhookUrl: {
          extended: true,
        },
      },
      { ...flags },
    );
  }
}

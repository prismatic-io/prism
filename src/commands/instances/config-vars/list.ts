import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListInstanceConfigVariablesDocument as LIST_INSTANCE_CONFIG_VARIABLES,
  type ListInstanceConfigVariablesQuery,
} from "../../../graphql/instances/listInstanceConfigVariables.generated.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Config Variables used on an Instance";
  static args = {
    instance: Args.string({ description: "ID of an instance", required: true }),
  };

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const {
      args: { instance },
      flags,
    } = await this.parse(ListCommand);

    let configVariables: InstanceConfigVariableNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const response: ListInstanceConfigVariablesQuery = await gqlRequest({
        document: LIST_INSTANCE_CONFIG_VARIABLES,
        variables: {
          id: instance,
          after: cursor,
        },
      });
      const {
        configVariables: { nodes, pageInfo },
      } = requireResource(response.instance, "instance");
      configVariables = [...configVariables, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
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
  }
}

type InstanceConfigVariableNode = NonNullable<
  ListInstanceConfigVariablesQuery["instance"]
>["configVariables"]["nodes"][number];

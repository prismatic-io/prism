import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListComponentActions2Document as LIST_COMPONENT_ACTIONS2 } from "../../../graphql/operations/listComponentActions2.generated.js";
import type { ListComponentActions2Query } from "../../../graphql/operations/listComponentActions2.generated.js";
import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { z } from "incur";

type ComponentDataSourceNode = NonNullable<
  ListComponentActions2Query["components"]["nodes"][number]
>["actions"]["nodes"][number];

interface DataSourceNode extends Omit<ComponentDataSourceNode, "detailDataSource"> {
  [index: string]: unknown;
  detailDataSource?: string;
}

export default defineCommand({
  outputPolicy: "agent-only",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "description",
      "dataSourceType",
      "detailDataSource",
      "componentid",
      "componentkey",
    ],
    true,
  ),
  description: "List Data Sources that Components implement",
  examples: [
    {
      description: "Get data sources related to the Salesforce component:",
      args: { componentKey: "salesforce" },
    },
  ],
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
      ...paginationFlags(),
      public: z
        .boolean()
        .optional()
        .describe(
          "Show data sources for the public component with the given key. Use this flag when you have a private component with the same key as a public component.",
        ),
      private: z
        .boolean()
        .optional()
        .describe(
          "Show data sources for the private component with the given key. Use this flag when you have a private component with the same key as a public component.",
        ),
    }),
  ),
  args: argsSchema(
    z.object({
      componentKey: z
        .string()
        .describe("The key of the component to show data sources for (e.g. 'salesforce')")
        .meta({ cli: { name: "Component Key" } }),
    }),
  ),
  async run(context) {
    const {
      options: flags,
      args: { componentKey },
    } = context;

    let dataSources: DataSourceNode[] = [];
    let componentId: string;
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo = {
      hasNextPage: false,
      endCursor: null as string | null,
    };

    while (hasNextPage) {
      const {
        components: {
          nodes: [component],
        },
      }: ResultOf<typeof LIST_COMPONENT_ACTIONS2> = await gqlRequest({
        document: LIST_COMPONENT_ACTIONS2,
        variables: {
          after: cursor,
          first: flags.first,
          componentKey,
          public: flags.public ? true : flags.private ? false : null,
        },
      });
      if (!component) {
        commandOutput.log(
          "The key you provided is not valid. Please run 'prism components:list -x' and identify a valid component key.",
        );
        commandOutput.exit(1);
      }
      dataSources = [
        ...dataSources,
        ...component.actions.nodes.map((action) => ({
          ...action,
          detailDataSource: action.detailDataSource?.label || "",
        })),
      ];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      finalPageInfo = component.actions.pageInfo;
      hasNextPage =
        component.actions.pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = ux.table(
      dataSources,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        key: {
          minWidth: 10,
          extended: true,
        },
        label: {},
        description: {},
        dataSourceType: { header: "Type" },
        detailDataSource: {
          header: "Detail Data Source",
          extended: true,
        },
        componentid: {
          get: () => componentId,
          extended: true,
        },
        componentkey: {
          get: () => componentKey,
          extended: true,
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo: finalPageInfo };
  },
});

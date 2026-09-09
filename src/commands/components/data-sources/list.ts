import { ListComponentActions2Document as LIST_COMPONENT_ACTIONS2 } from "../../../graphql/operations/listComponentActions2.generated.js";
import type { ListComponentActions2Query } from "../../../graphql/operations/listComponentActions2.generated.js";
import { writeCommandStatus } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli, Errors } from "incur";

type DataSourceNode =
  ListComponentActions2Query["components"]["nodes"][number]["actions"]["nodes"][number];
export default Cli.command({
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
  options: z.object({
    ...tableFlags(),
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
  args: z.object({
    componentKey: z
      .string()
      .describe("The key of the component to show data sources for (e.g. 'salesforce')"),
  }),
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
      }: ListComponentActions2Query = await gqlRequest({
        document: LIST_COMPONENT_ACTIONS2,
        variables: {
          after: cursor,
          first: flags.first,
          componentKey,
          public: flags.public ? true : flags.private ? false : null,
        },
      });
      if (!component) {
        writeCommandStatus(
          "The key you provided is not valid. Please run 'prism components:list -x' and identify a valid component key.",
        );
        throw new Errors.IncurError({
          code: "COMMAND_FAILED",
          message: "Exited with status 1",
          exitCode: 1,
        });
      }
      dataSources = [...dataSources, ...component.actions.nodes];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      finalPageInfo = component.actions.pageInfo;
      hasNextPage =
        component.actions.pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
          get: ({ detailDataSource }) => detailDataSource?.label || "",
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
